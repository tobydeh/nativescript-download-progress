import { File } from '@nativescript/core';

export type RequestOptions = {
  method?: string;
  headers?: Record<string, any>;
};

export type DownloadOptions = {
  url: string;
  request?: RequestOptions;
  destinationPath?: string;
};

export type ProgressCallback = (progress: number, url: string, destination: string) => void;

export abstract class DownloadProgressBase {

  protected progressCallback: ProgressCallback;

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
