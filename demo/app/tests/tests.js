var DownloadProgress = require("nativescript-download-progress").DownloadProgress;
var downloadProgress = new DownloadProgress();

describe("greet function", function() {
    it("exists", function() {
        expect(downloadProgress.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(downloadProgress.greet()).toEqual("Hello, NS");
    });
});