import { File } from '@nativescript/core';
import { DownloadOptions, RequestOptions, ProgressCallback } from './shared';

export declare class DownloadProgress {

  constructor();

  setProgressCallback(callback: ProgressCallback): void;
  /**
   * @deprecated Use setProgressCallback
   */
  addProgressCallback(callback: ProgressCallback): void;

  /**
   * @deprecated Use download
   */
  downloadFile (url: string): Promise<File>;
  /**
   * @deprecated Use download
   */
  downloadFile (url: string, destinationPath: string): Promise<File>;
  /**
   * @deprecated Use download
   */
  downloadFile (url: string, options: RequestOptions): Promise<File>;
  /**
   * @deprecated Use download
   */
  downloadFile (url: string, options: RequestOptions, destinationPath: string): Promise<File>;

  download(opts: DownloadOptions): Promise<File>;
}
