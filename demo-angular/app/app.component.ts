import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { DownloadProgress } from "nativescript-download-progress";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent implements OnInit { 

    progress:number = 0;

    public constructor(private changeDetectionRef: ChangeDetectorRef) {
        
    }

    public ngOnInit() {
        
    }
    
    public onDownloadTap(args) {
        var btn = args.object;
        btn.isEnabled = false;
        this.progress = 0;
    
        let download = new DownloadProgress();
        download.addProgressCallback((progress)=>{
            this.progress =  Math.round(progress*100);
            this.changeDetectionRef.detectChanges();
        })
        download.downloadFile("http://ipv4.download.thinkbroadband.com/20MB.zip").then((f)=>{
            console.log("Success", f.path);
            f.remove();
            btn.isEnabled = true;
        }).catch((e)=>{
            console.log("Error", e);
            btn.isEnabled = true;
        })
    }
}
