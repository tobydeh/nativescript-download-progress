/* global java org */
if (global.TNS_WEBPACK) {
  if (global.android) {
    // without this JavaProxy is missing and we can't import vendor below
    global.require('~/../internal/ts_helpers.js');
  }
  global.require('~/vendor');
} else {
  require('globals');
}
const File = require('@nativescript/core/file-system').File;
const getFilenameFromUrl = require('@nativescript/core/http/http-request/http-request-common').getFilenameFromUrl;

global.onmessage = function (msg) {
  const url = msg.data.url;
  const destinationFilePath = msg.data.destinationFilePath;
  const options = msg.data.options;
  let destinationFile;
  let contentLength = 0;
  let input;
  let output;
  let connection;

  try {
    if (destinationFilePath) {
      destinationFile = File.fromPath(destinationFilePath);
    } else {
      destinationFile = File.fromPath(getFilenameFromUrl(url));
    }
    destinationFile.writeTextSync('', function (e) {
      throw e;
    });
    const javaOptions = new org.nativescript.widgets.Async.Http.RequestOptions();
    javaOptions.url = url;

    const javaUrl = new java.net.URL(url);
    connection = javaUrl.openConnection();
    // allow optional headers to be sent
    if (options) {
      const { headers, method } = options;
      if (method) {
        // this is GET by default
        javaOptions.method = method;
        connection.setRequestMethod(method);
      }
      if (headers) {
        for (const key in headers) {
          connection.setRequestProperty(key, headers[key]);
        }
      }
    }

    connection.connect();
    const statusCode = connection.getResponseCode();
    if (statusCode < 200 || statusCode >= 400) {
      throw new Error('Server responded with status code ' + statusCode);
    }

    contentLength = connection.getContentLength();
    input = new java.io.BufferedInputStream(connection.getInputStream());
    output = new java.io.FileOutputStream(destinationFile.path);

    const data = Array.create('byte', 4096);
    let total = 0;
    let count = 0;
    while ((count = input.read(data)) !== -1) {
      total += count;
      output.write(data, 0, count);
      if (contentLength > 0) {
        const progress = ((100.0 / contentLength) * total) / 100;
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
    if (input) {
      input.close();
    }
    if (connection) {
      connection.disconnect();
    }
  }
};
