import type { DownloadManager } from "./DownloadManager";

const BeforeDownload = Symbol();
const Downloading = Symbol();
const FinishDownload = Symbol();
type DownloadStatus =
  | typeof BeforeDownload
  | typeof Downloading
  | typeof FinishDownload;

export class DownloadButton {
  public button: HTMLButtonElement;

  private downloadManager: DownloadManager;
  private status: DownloadStatus;

  constructor(downloadManager: DownloadManager) {
    this.downloadManager = downloadManager;
    this.status = BeforeDownload;

    this.button = document.createElement("button");
    this.button.innerHTML = "Download";
    this.button.addEventListener("click", async (event) => {
      event.preventDefault();
      this._updateText();
      await this.downloadManager.downloadPost();
      this._updateText();
    });
  }

  _updateText() {
    switch (this.status) {
      case BeforeDownload:
        this.button.textContent = "Now Downloading...";
        this.button.disabled = false;
        this.status = Downloading;
        break;

      case Downloading:
        this.button.textContent = "Finish Download!";
        this.button.disabled = false;
        this.status = FinishDownload;
        break;
    }
  }
}
