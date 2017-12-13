import * as application from "tns-core-modules/application";
import * as fs from "tns-core-modules/file-system";
import * as utils from "tns-core-modules/utils/utils";
import * as types from "tns-core-modules/utils/types";
import * as common from "tns-core-modules/http/http-request/http-request-common";
import getter = utils.ios.getter;

// Hack which I don't fully understand.
//var policy = new android.os.StrictMode.ThreadPolicy.Builder().permitAll().build();
//android.os.StrictMode.setThreadPolicy(policy);

export class DownloadProgress extends android.os.AsyncTask<string, Number, boolean> {

    private destinationFile: fs.File;
    
    private progressCallback;
    private contentLength = 0;

    private promiseResolve;
    private promiseReject;

    constructor(){
        super();
        return global.__native(this);
    }
    
    public addProgressCallback(callback: any) {
        this.progressCallback = callback;
    }

    public downloadFile(url: string, destinationFilePath?: string): Promise<fs.File> {
        return new Promise<fs.File>((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
            try{
                if(destinationFilePath){
                    this.destinationFile = fs.File.fromPath(destinationFilePath)
                } else {
                    this.destinationFile = fs.File.fromPath(common.getFilenameFromUrl(url))
                }
                this.destinationFile.writeTextSync("", (e)=>{
                    throw e
                })
                super.execute([url]);

            } catch (ex) {
                reject(ex);
            }
        });
    }

    public doInBackground(urls: any) {
        try {
            var javaOptions = new org.nativescript.widgets.Async.Http.RequestOptions();
            javaOptions.url = urls[0];
            javaOptions.method = 'GET';
            var javaUrl = new java.net.URL(urls[0]);
            var connection = <java.net.HttpURLConnection>javaUrl.openConnection();
            connection.connect();
            if (connection.getResponseCode() != java.net.HttpURLConnection.HTTP_OK) {
                throw "Server returned HTTP " + connection.getResponseCode()
            }
            this.contentLength = connection.getContentLength();

            var input = new java.io.BufferedInputStream(connection.getInputStream());
            var output = new java.io.FileOutputStream(this.destinationFile.path);

            var data = Array.create("byte", 4096);
            var total = 0;
            var count = 0;
            while ((count = input.read(data)) != -1) {
                total += count;
                output.write(data, 0, count);
                if (this.contentLength > 0) {
                    var progress = ((100.0/this.contentLength)*total)/100;
                    this.publishProgress([progress]);
                }
            }
        } catch (ex) {
            this.promiseReject(ex);
            return false;
        } finally {
            if(output) {
                output.flush();
                output.close();
            }
            if(input)
                input.close();
            if(connection)
                connection.disconnect();
        }
        return true;
    }

    public onProgressUpdate(progress) {
        if(this.progressCallback) {
            this.progressCallback(progress[0]);
        }
    }

    public onPostExecute(result) {
        if(result[0]) {
            this.promiseResolve(this.destinationFile)
        } else {
            this.promiseReject("Download failed")
        }
    }
}
