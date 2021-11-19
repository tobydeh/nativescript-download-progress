/* global java org */
import '@nativescript/core/globals';
import { File } from '@nativescript/core/file-system';

global.onmessage = function (msg) {
  const { url, destinationPath, request } = msg.data;
  const file = File.fromPath(destinationPath);
  let contentLength = 0;
  let input;
  let output;
  let connection;

  try {
    file.writeTextSync('', function (e) {
      throw e;
    });
    const javaOptions = new org.nativescript.widgets.Async.Http.RequestOptions();
    javaOptions.url = url;

    const javaUrl = new java.net.URL(url);
    connection = javaUrl.openConnection();
    const { method, headers } = request || {};
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

    connection.connect();
    const statusCode = connection.getResponseCode();
    if (statusCode < 200 || statusCode >= 400) {
      throw new Error('Server responded with status code ' + statusCode);
    }

    contentLength = connection.getContentLength();
    input = new java.io.BufferedInputStream(connection.getInputStream());
    output = new java.io.FileOutputStream(file.path);

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
    global.postMessage({ filePath: file.path });
  } catch (error) {
    global.postMessage({ error: error.message });
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
