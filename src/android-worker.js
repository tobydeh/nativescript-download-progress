if (global["TNS_WEBPACK"]) {
  if (global.android) {
    // without this JavaProxy is missing and we can't import vendor below
    global.require("~/../internal/ts_helpers.js");
  }
  global.require("~/vendor");
} else {
  require("globals");
}
//import * as fs from "tns-core-modules/file-system";
//import * as common from "tns-core-modules/http/http-request/http-request-common";
var fs = require("tns-core-modules/file-system");
var common = require("tns-core-modules/http/http-request/http-request-common");

global.onmessage = function(msg) {
  var url = msg.data.url;
  var destinationFilePath = msg.data.destinationFilePath;
  const options = msg.data.options;
  var destinationFile;

  var contentLength = 0;
  try {
    if (destinationFilePath) {
      destinationFile = fs.File.fromPath(destinationFilePath);
    } else {
      destinationFile = fs.File.fromPath(common.getFilenameFromUrl(url));
    }
    destinationFile.writeTextSync("", function(e) {
      throw e;
    });
    var javaOptions = new org.nativescript.widgets.Async.Http.RequestOptions();
    javaOptions.url = url;

    // allow methods other than GET

    var javaUrl = new java.net.URL(url);
    var connection = javaUrl.openConnection();
    // allow optional headers to be sent
    if (options) {
      const { headers, method } = options;
      if (method) {
        // this is GET by default
        javaOptions.method = method;
        connection.setRequestMethod(method);
      }
      if (headers) {
        for (var key in headers) {
          connection.setRequestProperty(key, headers[key]);
        }
      }
    }

    connection.connect();
    if (connection.getResponseCode() != java.net.HttpURLConnection.HTTP_OK) {
      throw "Server returned HTTP " + connection.getResponseCode();
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
        var progress = ((100.0 / contentLength) * total) / 100;
        global.postMessage({ progress: progress });
      }
    }
    global.postMessage({ filePath: destinationFile.path });
  } catch (ex) {
    global.postMessage({ error: ex });
  } finally {
    if (output) {
      output.flush();
      output.close();
    }
    if (input) input.close();
    if (connection) connection.disconnect();
  }
};

// does not handle errors with an `onerror` handler
// errors will propagate directly to the main thread Worker instance

// to handle errors implement the global.onerror handler:
// global.onerror = function(err) {}
