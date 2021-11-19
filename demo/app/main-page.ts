import { Button, EventData, fromObject, Page } from '@nativescript/core';
import { DownloadProgress } from 'nativescript-download-progress';

export function navigatingTo (args: EventData): void {
  const page = <Page>args.object;

  page.bindingContext = fromObject({
    url: 'http://ipv4.download.thinkbroadband.com/10MB.zip',
    progress: 0,
    text: 'Enter a url and tap Download',
    async submit (args: EventData) {
      const button = <Button>args.object;
      button.isEnabled = false;
      button.isUserInteractionEnabled = false;

      const dp = new DownloadProgress();
      dp.on('started', ({ contentLength }) => console.log('started', contentLength));
      dp.on('finished', ({ file }) => console.log('finished', file.path));
      dp.on('progress', ({ progress }) => {
        this.progress = Math.round(progress * 100);
      });

      this.text = 'Downloading...';

      try {
        const file = await dp.download({ url: this.url });
        this.text = `Downloaded to ${file.path}`;
      } catch (error) {
        this.text = `Error: ${error}`;
      }

      button.isEnabled = true;
      button.isUserInteractionEnabled = true;
    }
  });
}
