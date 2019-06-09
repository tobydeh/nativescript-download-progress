import * as fs from "tns-core-modules/file-system";

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
  ): Promise<fs.File>;
}
