require('globals'); // necessary to bootstrap tns modules on the new thread

import * as fs from "tns-core-modules/file-system";
import * as common from "tns-core-modules/http/http-request/http-request-common";

(<any>global).onmessage = function(msg) {
    var url = msg.data.url;
    var destinationFilePath = msg.data.destinationFilePath;
    var destinationFile: fs.File;
    
    var contentLength = 0;
    try{
        if(destinationFilePath){
            destinationFile = fs.File.fromPath(destinationFilePath)
        } else {
            destinationFile = fs.File.fromPath(common.getFilenameFromUrl(url))
        }
        destinationFile.writeTextSync("", (e)=>{
            throw e
        })
        var javaOptions = new org.nativescript.widgets.Async.Http.RequestOptions();
        javaOptions.url = url;
        javaOptions.method = 'GET';
        var javaUrl = new java.net.URL(url);
        var connection = <java.net.HttpURLConnection>javaUrl.openConnection();
        connection.connect();
        if (connection.getResponseCode() != java.net.HttpURLConnection.HTTP_OK) {
            throw "Server returned HTTP " + connection.getResponseCode()
        }
        contentLength = connection.getContentLength();

        var input = new java.io.BufferedInputStream(connection.getInputStream());
        var output = new java.io.FileOutputStream(destinationFile.path);

        var data = Array.create("byte", 4096);
        var total = 0;
        var count = 0;
        while ((count = input.read(data)) != -1) {
            total += count;
            output.write(data, 0, count);
            if (contentLength > 0) {
                var progress = ((100.0/contentLength)*total)/100;
                (<any>global).postMessage({ progress: progress });
            }
        }
        (<any>global).postMessage({ file:destinationFile });
    } catch (ex) {
        (<any>global).postMessage({ error:ex });
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
}


// does not handle errors with an `onerror` handler
// errors will propagate directly to the main thread Worker instance

// to handle errors implement the global.onerror handler:
// global.onerror = function(err) {}