import { File } from '@nativescript/core';

export declare type RequestOptions = {
  method: string;
  headers: Object;
};

export declare type ProgressCallback = (progress: number) => void;

export declare class DownloadProgress {
  constructor();
  setProgressCallback(callback: ProgressCallback): void;
  /**
   * @deprecated Use setProgressCallback
   */
  addProgressCallback(callback: ProgressCallback): void;
  downloadFile(
    url: string,
    options: (RequestOptions | string),
    destinationFilePath?: string
  ): Promise<File>;
}
