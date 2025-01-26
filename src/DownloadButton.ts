import type { DownloadManager } from "./DownloadManager";

export class DownloadButton {
  public button: HTMLButtonElement;

  private downloadManager: DownloadManager;

  constructor(downloadManager: DownloadManager) {
    this.downloadManager = downloadManager;

    this.button = document.createElement("button");
    this.button.innerHTML = "Download";
    this.button.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.downloadManager.downloadPost();
    });
  }
}
