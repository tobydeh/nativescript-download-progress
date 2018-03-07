import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';

import { DownloadProgress } from "nativescript-download-progress"

export function pageLoaded(args) {
    var page = args.object;
    var context = new observable.Observable();
    page.bindingContext = context;
}

export function onDownloadTap(args) {
    var btn = args.object;
    btn.isEnabled = false;
    btn.page.bindingContext.set('progress', 0);

    let download = new DownloadProgress();
    download.addProgressCallback((progress)=>{
        btn.page.bindingContext.set('progress', Math.round(progress*100));
    })
    download.downloadFile("http://ipv4.download.thinkbroadband.com/20MB.zip").then((f)=>{
        console.log("Success", f.path);
        btn.isEnabled = true;
    }).catch((e)=>{
        console.log("Error", e);
        btn.isEnabled = true;
    })
}
