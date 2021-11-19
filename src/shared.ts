import { File } from '@nativescript/core';
import { EventEmitter } from 'events';
import { DownloadOptions, ProgressCallback, RequestOptions } from '.';

export abstract class DownloadProgressBase extends EventEmitter {

  protected progressCallback: ProgressCallback;

  /**
   * @deprecated Use on
   */
  public setProgressCallback (callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * @deprecated Use setProgressCallback
   */
  public addProgressCallback (callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
  * @deprecated Use download
  */
  public downloadFile (
    url: string,
    options?: (RequestOptions | string),
    destinationPath?: string
  ): Promise<File> {
    const opts: DownloadOptions = { url, destinationPath };
    if (typeof options === 'string') {
      opts.destinationPath = options;
    } else if (options) {
      opts.request = options;
      if (destinationPath) {
        opts.destinationPath = destinationPath;
      }
    }
    return this.download(opts);
  }

  abstract download (opts: DownloadOptions): Promise<File>;
}
