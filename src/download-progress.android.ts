import { File } from '@nativescript/core';

type ProgressCallback = (progress: number) => void;

export class DownloadProgress {
  private promiseResolve: (value?: File | PromiseLike<File>) => void;
  private promiseReject: (reason: any) => void;
  private progressCallback: ProgressCallback;

  public addProgressCallback (callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  public downloadFile (
    url: string,
    options?: any,
    destinationFilePath?: string
  ): Promise<File> {
    let worker;
    if (global.TNS_WEBPACK) {
      // eslint-disable-next-line
      const WorkerScript = require('nativescript-worker-loader!./android-worker.js');
      worker = new WorkerScript();
    } else {
      worker = new Worker('./android-worker.js');
    }
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

      worker.postMessage({
        url,
        options: isOptionsObject ? options : undefined,
        destinationFilePath: destinationFilePath
      });
      worker.onmessage = (msg: any) => {
        if (msg.data.progress) {
          if (this.progressCallback) {
            this.progressCallback(msg.data.progress);
          }
        } else if (msg.data.filePath) {
          worker.terminate();
          this.promiseResolve(File.fromPath(msg.data.filePath));
        } else {
          worker.terminate();
          this.promiseReject(msg.data.error);
        }
      };

      worker.onerror = err => {
        console.log(
          `An unhandled error occurred in worker: ${err.filename}, line: ${
            err.lineno
          } :`
        );
        this.promiseReject(err.message);
      };
    });
  }
}
