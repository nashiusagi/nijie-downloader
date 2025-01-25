import GMFetch from "./libs/GMFetch";
import JSZip from "jszip";

interface Status {
  done: number;
  total: number;
  zip: number;
}

export class DownloadManager {
  private imgElements: Array<HTMLImageElement>;
  private currentStatus: Status;

  constructor() {
    this.imgElements = Array.from(document.getElementsByTagName("img"));

    this.currentStatus = { done: 0, total: 0, zip: 0 };
  }

  extractPostImageLinks() {
    return this.imgElements
      .map((imgElement) => imgElement.src)
      .filter((imgUrl) => this._IsMatchPostImageUrl(imgUrl));
  }

  _IsMatchPostImageUrl(imgUrl: string): boolean {
    const postImagePattern =
      /https\:\/\/pic.nijie.net\/(\d+)\/nijie\/[A-Za-z0-9]+\/(\d+)\/(\d+)\/illust\/[A-Za-z0-9]+.jpg/;

    return !!imgUrl.match(postImagePattern);
  }

  async requestInfo(postId: number) {
    const res = await GMFetch(
      `https://nijie.info/view_popup.php?id=${postId}`,
      {
        responseType: "text",
      },
    );

    // property change
    const imgUrls = this.extractPostImageLinks();

    return {
      imgUrls: imgUrls,
    };
  }

  async _downloadPost(postId) {
    const info = await this.requestInfo(postId);
    this.currentStatus.total = info.imgUrls.length;

    let bin: Blob;
    try {
      const zip = new JSZip();

      for (const [index, imgUrl] of info.imgUrls) {
        const blob = await GMFetch(imgUrl);
        const name = `${index}.jpg`;
        zip.file(name, blob);

        this.currentStatus.done++;
      }
      bin = await zip.generateAsync({ type: "blob" }, (metadata) => {
        this.currentStatus.zip = metadata.percent;
      });
    } catch (e) {
      throw new Error("downloadError");
    }
  }
}
