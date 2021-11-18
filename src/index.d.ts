import { File } from '@nativescript/core';
import { RequestOptions, ProgressCallback } from './types';

export declare class DownloadProgress {
  constructor();
  setProgressCallback(callback: ProgressCallback): void;
  /**
   * @deprecated Use setProgressCallback
   */
  addProgressCallback(callback: ProgressCallback): void;
  downloadFile(
    url: string,
    options?: (RequestOptions | string),
    destinationFilePath?: string
  ): Promise<File>;
}
