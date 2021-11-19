import { File } from '@nativescript/core';
import { getFilenameFromUrl } from '@nativescript/core/http/http-request/http-request-common';
import { DownloadProgressBase } from './shared';
import { DownloadOptions } from '.';

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

export class DownloadProgress extends DownloadProgressBase {

  public download (opts: DownloadOptions): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const progressCallback = this.progressCallback;
      const emit = (event: string, data: any) => {
        this.emit(event, data);
      };
      const {
        url,
        request,
        destinationPath = getFilenameFromUrl(url)
      } = opts;
      const file = File.fromPath(destinationPath);

      try {
        file.writeTextSync('', e => { throw e; });
        const urlRequest = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
        urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);
        const { method, headers } = request || {};
        urlRequest.HTTPMethod = method || 'GET';
        if (headers) {
          for (const key in headers) {
            urlRequest.setValueForHTTPHeaderField(headers[key], key);
          }
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
            this.handle = NSFileHandle.fileHandleForWritingAtPath(file.path);
            this.handle.truncateAtOffsetError(0);
            this.contentLength = response.expectedContentLength;
            emit('started', { contentLength: this.contentLength });
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
            if (this.contentLength > 0) {
              const progress = written.value / this.contentLength;
              emit('progress', { progress, url, destinationPath });
              if (progressCallback) {
                progressCallback(progress, url, destinationPath);
              }
            }
          }

          public URLSessionTaskDidCompleteWithError (
            _session: NSURLSession,
            task: NSURLSessionTask,
            error: NSError
          ) {
            this.handle.closeAndReturnError();
            if (error) {
              reject(error.localizedDescription);
            } else {
              const statusCode = (task?.response as NSHTTPURLResponse)?.statusCode;
              if (statusCode < 200 || statusCode >= 400) {
                return reject('Server responded with status code ' + statusCode);
              }
              emit('finished', { file });
              resolve(file);
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
