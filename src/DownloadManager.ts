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
      /https\:\/\/pic.nijie.net\/(\d+)\/nijie\/[A-Za-z0-9]+\/(\d+)\/(\d+)\/illust\/[A-Za-z0-9\_]+.jpg/;

    return !!imgUrl.match(postImagePattern);
  }

  async generateZip() {
    const imgUrls = this.extractPostImageLinks();
    this.currentStatus.total = imgUrls.length;

    let bin: Blob;

    const zip = new JSZip();
    for (let i = 0; i < imgUrls.length; i++) {
      const imgUrl = imgUrls[i];
      console.log(imgUrl);
      const blob = await GMFetch(imgUrl, {
        responseType: "arraybuffer",
      });
      console.log(blob);
      const name = `${i}.jpg`;
      zip.file(name, blob);

      this.currentStatus.done++;
    }
    bin = await zip.generateAsync({ type: "blob" }, (metadata) => {
      this.currentStatus.zip = metadata.percent;
    });

    return bin;
  }

  async downloadPost() {
    const bin = await this.generateZip();
    console.log(bin);

    // fire the download
    const dl = document.createElement("a");
    dl.href = URL.createObjectURL(bin);
    dl.download = "test.zip";
    document.body.append(dl);
    dl.click();
    dl.remove();
    console.log("DONE!");
  }
}
