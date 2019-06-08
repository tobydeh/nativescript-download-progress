import * as fs from "tns-core-modules/file-system";

declare type RequestOptions = {
  method: string;
  headers: Object;
};
export declare class DownloadProgress {
  constructor();
  addProgressCallback(callback: any);
  downloadFile(
    url: string,
    options?: RequestOptions,
    destinationFilePath?: string
  ): Promise<fs.File>;
}
