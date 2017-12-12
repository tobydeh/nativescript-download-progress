import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';

import { DownloadProgress } from "nativescript-download-progress"

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    
    let download = new DownloadProgress();
    download.addProgressCallback((progress)=>{
        console.log("Progress", progress)
    })
    download.downloadFile("http://flipcode.co.uk/com.bigapp.bestofengland.kent.zip").then((f)=>{
        console.log("Success", f)
    }).catch((e)=>{
        console.log("Error", e)
    })
}
