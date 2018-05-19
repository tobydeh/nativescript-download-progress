import * as application from "tns-core-modules/application";
import * as fs from "tns-core-modules/file-system";

export class DownloadProgress {

    private promiseResolve;
    private promiseReject;
    private progressCallback;

    public addProgressCallback(callback: any) {
        this.progressCallback = callback;
    }

    public downloadFile(url: string, destinationFilePath?: string): Promise<fs.File> {
        var worker;
        if (global["TNS_WEBPACK"]) {
            var WorkerScript = require("nativescript-worker-loader!./android-worker.js");
            worker = new WorkerScript();
        }
        else {
            worker = new Worker("./android-worker.js");
        }
        return new Promise<fs.File>((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;

            worker.postMessage({ url: url, destinationFilePath: destinationFilePath });
            worker.onmessage = (msg:any)=> {
                if(msg.data.progress) {
                    if(this.progressCallback) {
                        this.progressCallback(msg.data.progress);
                    }
                } else if(msg.data.filePath) {
                    worker.terminate();
                    this.promiseResolve(fs.File.fromPath(msg.data.filePath));
                } else {
                    worker.terminate();
                    this.promiseReject(msg.data.error);
                }
            }
        
            worker.onerror = (err)=> {
                console.log(`An unhandled error occurred in worker: ${err.filename}, line: ${err.lineno} :`);
                this.promiseReject(err.message);
            }
        });
    }
}
