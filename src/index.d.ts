import { File } from '@nativescript/core';

export declare type RequestOptions = {
  method: string;
  headers: Object;
};

export declare class DownloadProgress {
  constructor();
  addProgressCallback(callback: any): void;
  downloadFile(
    url: string,
    options?: RequestOptions,
    destinationFilePath?: string
  ): Promise<File>;
}
