# nativescript-download-progress ![apple](https://cdn3.iconfinder.com/data/icons/picons-social/57/16-apple-32.png) ![android](https://cdn4.iconfinder.com/data/icons/logos-3/228/android-32.png)

[![npm version](https://badge.fury.io/js/nativescript-download-progress.svg)](http://badge.fury.io/js/nativescript-download-progress)

## Introduction

This plugin allows you to download large files and provides progress updates.

Nativescripts http.getFile method stores the data in memory which can cause out of memory exceptions and doesn't provide progress updates.

## Installation


```javascript
tns plugin add nativescript-download-progress
```

## Examples

```typescript
import { DownloadProgress } from "nativescript-download-progress"

const dp = new DownloadProgress();
dp.setProgressCallback((progress, url, destination) => {
    console.log('Progress:', progress, 'URL:', url, 'Destination', destination);
})
dp.downloadFile("http://ipv4.download.thinkbroadband.com/20MB.zip").then(file => {
    console.log("Success", file);
}).catch(error => {
    console.log("Error", error);
})
```

### Passing request headers

```typescript
import { DownloadProgress } from "nativescript-download-progress"

const dp = new DownloadProgress();
dp.setProgressCallback((progress, url, destination) => {
    console.log('Progress:', progress, 'URL:', url, 'Destination', destination);
})
const url = "http://ipv4.download.thinkbroadband.com/20MB.zip";
const destinationPath = "some/path/to/file.zip";
const requestOptions: RequestOptions = {
    method: "GET",
    headers: {
       Authorization: "Bearer token",
    }
};
dp.downloadFile(url, requestOptions, destinationPath).then(file => {
    console.log("Success", file);
}).catch(error => {
    console.log("Error", error);
})
```

### Async / Await

```typescript
import { DownloadProgress } from "nativescript-download-progress"

const dp = new DownloadProgress();
dp.setProgressCallback((progress, url, destination) => {
    console.log('Progress:', progress, 'URL:', url, 'Destination', destination);
})
try {
    const f = await downloadFile("http://ipv4.download.thinkbroadband.com/20MB.zip");
} catch(e) {
    console.log("Error", error);
}
```

## License

Apache License Version 2.0, January 2004
