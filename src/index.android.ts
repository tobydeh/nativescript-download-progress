import { File } from '@nativescript/core';
import { getFilenameFromUrl } from '@nativescript/core/http/http-request/http-request-common';
import { DownloadOptions, DownloadProgressBase } from './shared';

export class DownloadProgress extends DownloadProgressBase {

  public download (opts: DownloadOptions): Promise<File> {
    const worker = new Worker('./android-worker.js');
    return new Promise<File>((resolve, reject) => {

      const {
        url,
        request,
        destinationPath = getFilenameFromUrl(url)
      } = opts;

      worker.postMessage({ url, destinationPath, request, });
      worker.onmessage = (msg: any) => {
        if (msg.data.progress) {
          if (this.progressCallback) {
            this.progressCallback(msg.data.progress, url, destinationPath);
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
