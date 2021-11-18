import { EventData, fromObject, Page } from '@nativescript/core';
import { DownloadProgress } from 'nativescript-download-progress';

// Basic Example
// download.downloadFile('http://ipv4.download.thinkbroadband.com/10MB.zip').then(f => {
//   console.log('Success', f.path);
// }).catch(error => {
//   console.log('Error', error);
// });

// Example passing request options and file path
// download.downloadFile('http://ipv4.download.thinkbroadband.com/10MB.zip', {
//   headers: { 'some-header': 'some-value' },
//   method: 'GET'
// }, path.join(knownFolders.documents().path, 'test.zip')).then(f => {
//   console.log('Success', f.path);
// }).catch(error => {
//   console.log('Error', error);
// });

export function navigatingTo (args: EventData): void {
  const page = <Page>args.object;
  const download = new DownloadProgress();

  page.bindingContext = fromObject({
    url: 'http://ipv4.download.thinkbroadband.com/10MB.zip',
    progress: 0,
    text: 'Enter a url and tap Download',
    async submit () {

      download.setProgressCallback(progress => {
        this.progress = Math.round(progress * 100);
      });

      this.text = 'Downloading...';

      try {
        const file = await download.downloadFile(this.url);
        this.text = `Downloaded to ${file.path}`;
      } catch (error) {
        this.text = `Error: ${error}`;
      }
    }
  });
}
