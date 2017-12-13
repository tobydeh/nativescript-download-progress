# nativescript-download-progress ![apple](https://cdn3.iconfinder.com/data/icons/picons-social/57/16-apple-32.png) ![android](https://cdn4.iconfinder.com/data/icons/logos-3/228/android-32.png)

[![npm version](https://badge.fury.io/js/nativescript-download-progress.svg)](http://badge.fury.io/js/nativescript-download-progress)

## Introduction

This plugin allows you to download large files and provides progress updates.

Nativescripts http.getFile method stores the data in memory which causes out of memory exceptions with large files.

## Installation


```javascript
tns plugin add nativescript-download-progress
```

## Javascript Example 

	
```javascript
var DownloadProgress = require("nativescript-download-progress").DownloadProgress;

var download = new DownloadProgress();
download.addProgressCallback(function(progress) {
    console.log('Progress:', progress);
})
download.downloadFile("http://ipv4.download.thinkbroadband.com/20MB.zip").then(function(f){
    console.log("Success", f);
}).catch(function(e){
    console.log("Error", e);
})
```

## Typescript Example 

```typescript
import { DownloadProgress } from "nativescript-download-progress"

var download = new DownloadProgress();
download.addProgressCallback((progress)=>{
    console.log('Progress:', progress);
})
download.downloadFile("http://ipv4.download.thinkbroadband.com/20MB.zip").then((f)=>{
    console.log("Success", f);
}).catch((e)=>{
    console.log("Error", e);
})
```
    
## License

Apache License Version 2.0, January 2004
