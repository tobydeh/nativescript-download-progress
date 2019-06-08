import * as fs from "tns-core-modules/file-system";
import * as utils from "tns-core-modules/utils/utils";
import * as common from "tns-core-modules/http/http-request/http-request-common";
import getter = utils.ios.getter;

const currentDevice = utils.ios.getter(UIDevice, UIDevice.currentDevice);
const device =
  currentDevice.userInterfaceIdiom === UIUserInterfaceIdiom.Phone
    ? "Phone"
    : "Pad";
const osVersion = currentDevice.systemVersion;

const USER_AGENT_HEADER = "User-Agent";
const USER_AGENT = `Mozilla/5.0 (i${device}; CPU OS ${osVersion.replace(
  ".",
  "_"
)} like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/${osVersion} Mobile/10A5355d Safari/8536.25`;
const sessionConfig = getter(
  NSURLSessionConfiguration,
  NSURLSessionConfiguration.defaultSessionConfiguration
);
const queue = getter(NSOperationQueue, NSOperationQueue.mainQueue);

export class DownloadProgress extends NSObject
  implements NSURLSessionDataDelegate {
  public static ObjCProtocols = [NSURLSessionDataDelegate];

  private destinationFile: fs.File;
  private urlResponse: NSURLResponse;

  private progressCallback;

  private promiseResolve;
  private promiseReject;

  public addProgressCallback(callback: any) {
    this.progressCallback = callback;
  }

  public downloadFile(
    url: string,
    options?: any,
    destinationFilePath?: string
  ): Promise<fs.File> {
    return new Promise<fs.File>((resolve, reject) => {
      // we check if options is a string
      // since in older versions of this plugin,
      // destinationFilePath was the second parameter.
      // so we check if options is possibly destinationFilePath {String}
      let isOptionsObject = true;
      if (typeof options === "string") {
        isOptionsObject = false;
        destinationFilePath = options;
      }

      this.promiseResolve = resolve;
      this.promiseReject = reject;
      try {
        if (destinationFilePath) {
          this.destinationFile = fs.File.fromPath(destinationFilePath);
        } else {
          this.destinationFile = fs.File.fromPath(
            common.getFilenameFromUrl(url)
          );
        }
        this.destinationFile.writeTextSync("", e => {
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
          urlRequest.HTTPMethod = "GET";
        }
        const session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
          sessionConfig,
          this,
          queue
        );
        const dataTask = session.dataTaskWithRequest(urlRequest);

        dataTask.resume();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public URLSessionDataTaskDidReceiveResponseCompletionHandler(
    session: NSURLSession,
    dataTask: NSURLSessionDataTask,
    response: NSURLResponse,
    completionHandler: (p1: NSURLSessionResponseDisposition) => void
  ) {
    completionHandler(NSURLSessionResponseDisposition.Allow);
    this.urlResponse = response;
  }
  public URLSessionDataTaskDidReceiveData(
    session: NSURLSession,
    dataTask: NSURLSessionDataTask,
    data: NSData
  ) {
    const fileHandle = NSFileHandle.fileHandleForWritingAtPath(
      this.destinationFile.path
    );
    fileHandle.seekToEndOfFile();
    fileHandle.writeData(data);
    const progress =
      ((100.0 / this.urlResponse.expectedContentLength) *
        fileHandle.seekToEndOfFile()) /
      100;
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
    fileHandle.closeFile();
  }

  public URLSessionTaskDidCompleteWithError(
    session: NSURLSession,
    task: NSURLSessionTask,
    error: NSError
  ) {
    if (error) {
      this.promiseReject(error);
    } else {
      this.promiseResolve(this.destinationFile);
    }
  }
}
