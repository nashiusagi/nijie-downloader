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
    const postImagePattern = /https\:\/\/pic.nijie.net\/.*\.jpg/;

    return !!imgUrl.match(postImagePattern);
  }

  async generateZip() {
    const imgUrls = this.extractPostImageLinks();
    console.log(imgUrls);
    this.currentStatus.total = imgUrls.length;

    const zip = new JSZip();

    // NOTE: should avoid `foreach`.
    // https://zenn.dev/wintyo/articles/2973f15a265581
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
    const bin = await zip.generateAsync({ type: "blob" }, (metadata) => {
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
