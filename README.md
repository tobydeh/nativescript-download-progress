# nativescript-download-progress ![apple](https://cdn3.iconfinder.com/data/icons/picons-social/57/16-apple-32.png) ![android](https://cdn4.iconfinder.com/data/icons/logos-3/228/android-32.png)

[![npm version](https://badge.fury.io/js/nativescript-download-progress.svg)](http://badge.fury.io/js/nativescript-download-progress)

Nativescripts http.getFile method stores the data in memory which can lead to problems with large files. This plugin writes the data to disk not memory and provides progress updates.

## Installation


```javascript
tns plugin add nativescript-download-progress
```

## Usage 

	
```javascript
var DownloadProgress = require("nativescript-download-progress").DownloadProgress;
// Angular
// import { DownloadProgress } from "nativescript-download-progress"

var download = new DownloadProgress();
download.addProgressCallback((progress)=>{
    console.log('Progress:', progress);
})
download.downloadFile("http://ipv4.download.thinkbroadband.com/20MB.zip").then((f)=>{
    console.log("Success", f);
}).catch((e)=>{
    console.log("Error", e);
})
```)
    
## License

Apache License Version 2.0, January 2004
