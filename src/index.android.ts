import { File } from '@nativescript/core';
import { ProgressCallback, RequestOptions } from './types';

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
    const worker = new Worker('./android-worker.js');
    return new Promise<File>((resolve, reject) => {
      // we check if options is a string
      // since in older versions of this plugin,
      // destinationFilePath was the second parameter.
      // so we check if options is possibly destinationFilePath {String}
      if (typeof options === 'string') {
        destinationFilePath = options;
      }

      worker.postMessage({
        url,
        destinationFilePath,
        options: typeof options !== 'string' ? options : undefined,
      });
      worker.onmessage = (msg: any) => {
        if (msg.data.progress) {
          if (this.progressCallback) {
            this.progressCallback(msg.data.progress, url, destinationFilePath);
          }
        } else if (msg.data.filePath) {
          resolve(File.fromPath(msg.data.filePath));
        } else {
          reject(msg.data.error);
        }
      };

      worker.onerror = err => {
        console.error(`An unhandled error occurred in worker: ${err.filename}, line: ${ err.lineno } :`);
        reject(err.message);
      };
    });
  }
}
