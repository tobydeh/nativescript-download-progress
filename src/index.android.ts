import { File } from '@nativescript/core';
import { getFilenameFromUrl } from '@nativescript/core/http/http-request/http-request-common';
import { DownloadProgressBase } from './shared';
import { DownloadOptions } from '.';

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
        if (msg.data.contentLength) {
          this.emit('started', { contentLength: msg.data.contentLength });
        }
        else if (msg.data.progress) {
          this.emit('progress', { progress: msg.data.progress, url, destinationPath });
          if (this.progressCallback) {
            this.progressCallback(msg.data.progress, url, destinationPath);
          }
        } else if (msg.data.filePath) {
          const file = File.fromPath(msg.data.filePath);
          this.emit('finished', { file });
          resolve(file);
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
