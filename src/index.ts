import { File } from '@nativescript/core';
import { EventEmitter } from 'events';

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

export declare class DownloadProgress extends EventEmitter {

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
