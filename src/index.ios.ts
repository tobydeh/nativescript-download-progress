import { File } from '@nativescript/core';
import { getFilenameFromUrl } from '@nativescript/core/http/http-request/http-request-common';
import { ProgressCallback, RequestOptions } from './types';

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
  private progressCallback: ProgressCallback;

  public setProgressCallback (callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * @deprecated Use setProgressCallback
   */
  public addProgressCallback (callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  public downloadFile (url: string): Promise<File>;
  public downloadFile (url: string, destinationFile: string): Promise<File>;
  public downloadFile (url: string, options: RequestOptions, destinationFile: string): Promise<File>;
  public downloadFile (
    url: string,
    options?: (RequestOptions | string),
    destinationFilePath?: string
  ): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const progressCallback = this.progressCallback;
      let destinationFile: File;
      // we check if options is a string
      // since in older versions of this plugin,
      // destinationFilePath was the second parameter.
      // so we check if options is possibly destinationFilePath {String}
      if (typeof options === 'string') {
        destinationFilePath = options;
      }

      try {
        if (destinationFilePath) {
          destinationFile = File.fromPath(destinationFilePath);
        } else {
          destinationFile = File.fromPath(getFilenameFromUrl(url));
        }

        destinationFile.writeTextSync('', e => {
          throw e;
        });
        const urlRequest = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
        urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);
        if (options && typeof options !== 'string') {
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

        @NativeClass()
        class DownloadProgressDelegate extends NSObject implements NSURLSessionDataDelegate {

          static ObjCProtocols = [NSURLSessionDataDelegate];
          private contentLength: number;
          private handle: NSFileHandle;

          public URLSessionDataTaskDidReceiveResponseCompletionHandler (
            _session: NSURLSession,
            _dataTask: NSURLSessionDataTask,
            response: NSURLResponse,
            completionHandler: (p1: NSURLSessionResponseDisposition) => void
          ) {
            completionHandler(NSURLSessionResponseDisposition.Allow);
            this.handle = NSFileHandle.fileHandleForWritingAtPath(destinationFile.path);
            this.handle.truncateAtOffsetError(0);
            this.contentLength = response.expectedContentLength;
          }

          public URLSessionDataTaskDidReceiveData (
            _session: NSURLSession,
            _dataTask: NSURLSessionDataTask,
            data: NSData
          ) {
            const written = new interop.Reference(0);
            if (!this.handle.seekToEndReturningOffsetError(written)) {
              throw new Error('Error seeking end of file');
            }
            if (!this.handle.writeDataError(data)) {
              throw new Error('Error writing data');
            }
            if (this.contentLength > 0 && progressCallback) {
              const progress = written.value / this.contentLength;
              progressCallback(progress, url, destinationFilePath);
            }
          }

          public URLSessionTaskDidCompleteWithError (
            _session: NSURLSession,
            task: NSURLSessionTask,
            error: NSError
          ) {
            this.handle.closeAndReturnError();
            if (error) {
              reject(error);
            } else {
              const statusCode = (task?.response as NSHTTPURLResponse)?.statusCode;
              if (statusCode < 200 || statusCode >= 400) {
                reject('Server responded with status code ' + statusCode);
                return;
              }
              resolve(destinationFile);
            }
          }
        }

        const session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
          sessionConfig,
          <DownloadProgressDelegate>DownloadProgressDelegate.new(),
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
