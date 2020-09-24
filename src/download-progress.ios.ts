import { File } from '@nativescript/core';
import * as common from '@nativescript/core/http/http-request/http-request-common';

const currentDevice = UIDevice.currentDevice;
const device =
  currentDevice.userInterfaceIdiom === UIUserInterfaceIdiom.Phone
    ? 'Phone'
    : 'Pad';
const osVersion = currentDevice.systemVersion;

const USER_AGENT_HEADER = 'User-Agent';
const USER_AGENT = `Mozilla/5.0 (i${device}; CPU OS ${osVersion.replace(
  '.',
  '_'
)} like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/${osVersion} Mobile/10A5355d Safari/8536.25`;
const sessionConfig = NSURLSessionConfiguration.defaultSessionConfiguration;
const queue = NSOperationQueue.mainQueue;

export class DownloadProgress {
  destinationFile: File;
  urlResponse: NSURLResponse;
  progressCallback;
  promiseResolve;
  promiseReject;

  public addProgressCallback(callback: any) {
    this.progressCallback = callback;
  }

  public downloadFile(
    url: string,
    options?: any,
    destinationFilePath?: string
  ): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      // we check if options is a string
      // since in older versions of this plugin,
      // destinationFilePath was the second parameter.
      // so we check if options is possibly destinationFilePath {String}
      let isOptionsObject = true;
      if (typeof options === 'string') {
        isOptionsObject = false;
        destinationFilePath = options;
      }

      this.promiseResolve = resolve;
      this.promiseReject = reject;
      try {
        if (destinationFilePath) {
          this.destinationFile = File.fromPath(destinationFilePath);
        } else {
          this.destinationFile = File.fromPath(common.getFilenameFromUrl(url));
        }
        this.destinationFile.writeTextSync('', e => {
          throw e;
        });
        const urlRequest = NSMutableURLRequest.requestWithURL(
          NSURL.URLWithString(url)
        );
        urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);
        if (options && isOptionsObject) {
          const { method, headers } = options;
          if (method) {
            urlRequest.HTTPMethod = method;
          }
          if (headers) {
            for (const key in headers) {
              urlRequest.setValueForHTTPHeaderField(headers[key], key);
            }
          }
        } else {
          urlRequest.HTTPMethod = 'GET';
        }
        const session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
          sessionConfig,
          new DownloadProgressDelegate(),
          queue
        );
        const dataTask = session.dataTaskWithRequest(urlRequest);

        dataTask.resume();
      } catch (ex) {
        reject(ex);
      }
    });
  }
}

@NativeClass()
class DownloadProgressDelegate
  extends NSObject
  implements NSURLSessionDataDelegate {
  static ObjCProtocols = [NSURLSessionDataDelegate];
  private _owner: WeakRef<DownloadProgress>;

  static initWithOwner(owner: DownloadProgress) {
    const delegate = <DownloadProgressDelegate>DownloadProgressDelegate.new();
    delegate._owner = new WeakRef(owner);
    return delegate;
  }

  URLSessionDataTaskDidReceiveResponseCompletionHandler(
    session: NSURLSession,
    dataTask: NSURLSessionDataTask,
    response: NSURLResponse,
    completionHandler: (p1: NSURLSessionResponseDisposition) => void
  ) {
    const owner = this._owner.get();
    completionHandler(NSURLSessionResponseDisposition.Allow);
    owner.urlResponse = response;
  }

  URLSessionDataTaskDidReceiveData(
    session: NSURLSession,
    dataTask: NSURLSessionDataTask,
    data: NSData
  ) {
    const owner = this._owner.get();
    const fileHandle = NSFileHandle.fileHandleForWritingAtPath(
      owner.destinationFile.path
    );
    fileHandle.seekToEndOfFile();
    fileHandle.writeData(data);
    const progress =
      ((100.0 / owner.urlResponse.expectedContentLength) *
        fileHandle.seekToEndOfFile()) /
      100;
    if (owner.progressCallback) {
      owner.progressCallback(progress);
    }
    fileHandle.closeFile();
  }

  URLSessionTaskDidCompleteWithError(
    session: NSURLSession,
    task: NSURLSessionTask,
    error: NSError
  ) {
    const owner = this._owner.get();
    if (error) {
      owner.promiseReject(error);
    } else {
      owner.promiseResolve(owner.destinationFile);
    }
  }
}
