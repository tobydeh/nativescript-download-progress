import * as application from "tns-core-modules/application";
import * as fs from "tns-core-modules/file-system";
import * as utils from "tns-core-modules/utils/utils";
import * as types from "tns-core-modules/utils/types";
import * as common from "tns-core-modules/http/http-request/http-request-common";
import getter = utils.ios.getter;

var currentDevice = utils.ios.getter(UIDevice, UIDevice.currentDevice);
var device = currentDevice.userInterfaceIdiom === UIUserInterfaceIdiom.Phone ? "Phone" : "Pad";
var osVersion = currentDevice.systemVersion;

var USER_AGENT_HEADER = "User-Agent";
var USER_AGENT = `Mozilla/5.0 (i${device}; CPU OS ${osVersion.replace('.', '_')} like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/${osVersion} Mobile/10A5355d Safari/8536.25`;
var sessionConfig = getter(NSURLSessionConfiguration, NSURLSessionConfiguration.defaultSessionConfiguration);
var queue = getter(NSOperationQueue, NSOperationQueue.mainQueue);

export class DownloadProgress extends NSObject implements NSURLSessionDataDelegate {
    
    public static ObjCProtocols = [NSURLSessionDataDelegate];

    private destinationFile: fs.File;
    private urlResponse: NSURLResponse;
    
    private progressCallback;

    private promiseResolve;
    private promiseReject;

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
                var urlRequest = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
                urlRequest.HTTPMethod = 'GET';
                urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);
                var session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, this, queue);
                var dataTask = session.dataTaskWithRequest(urlRequest);
                
                dataTask.resume();
                
            } catch (ex) {
                reject(ex);
            }
        });
    }

    public URLSessionDataTaskDidReceiveResponseCompletionHandler(session: NSURLSession, dataTask: NSURLSessionDataTask, response: NSURLResponse, completionHandler: (p1: NSURLSessionResponseDisposition) => void) {
        completionHandler(NSURLSessionResponseDisposition.Allow);
        this.urlResponse = response;
    }
    public URLSessionDataTaskDidReceiveData(session: NSURLSession, dataTask: NSURLSessionDataTask, data: NSData){
        var fileHandle = NSFileHandle.fileHandleForWritingAtPath(this.destinationFile.path);
        fileHandle.seekToEndOfFile();
        fileHandle.writeData(data);
        var progress = ((100.0/this.urlResponse.expectedContentLength)*fileHandle.seekToEndOfFile())/100;
        if(this.progressCallback) {
            this.progressCallback(progress);
        }
        fileHandle.closeFile();
    }

    public URLSessionTaskDidCompleteWithError(session: NSURLSession, task: NSURLSessionTask, error: NSError) {
        if(error) {
            this.promiseReject(error);
        } else {
            this.promiseResolve(this.destinationFile)
        }
    }
}
