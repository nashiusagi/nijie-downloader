import { DownloadButton } from "./DownloadButton";
import type { DownloadManager } from "./DownloadManager";
import { addStyle } from "./utils/addStyle";

export class PostDownloadButton extends DownloadButton {
  constructor(downloadManager: DownloadManager) {
    super(downloadManager);

    this.button.id = "nijie-download-button";

    addStyle(`
      #nijie-download-button {
        text-align: center;
        font-size: 12px;
        padding: 10px 7px 13px;
        font-weight: bold;
        text-decoration: none;
        color: #fff;
        display: block;
        width: 100px;
        border-radius: 30px;
        border-color: #0081e0;
        background: #0081e0;
        text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.4);
      }
    `);
  }
}
