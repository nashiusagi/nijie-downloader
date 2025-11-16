import GMFetch from "./libs/GMFetch";
import JSZip from "jszip";

export interface DownloadStatus {
  done: number;
  total: number;
  zip: number;
}

export interface DownloadOptions {
  filename?: string;
  imageExtension?: string;
}

export class DownloadManager {
  private imgElements: Array<HTMLImageElement>;
  private currentStatus: DownloadStatus;
  private document: Document;

  constructor(document?: Document) {
    const doc = document || globalThis.document;
    this.document = doc;
    this.imgElements = Array.from(doc.getElementsByTagName("img"));

    this.currentStatus = { done: 0, total: 0, zip: 0 };
  }

  extractPostImageLinks(): string[] {
    return this.imgElements
      .map((imgElement) => imgElement.src)
      .filter((imgUrl) => this.isMatchPostImageUrl(imgUrl));
  }

  private isMatchPostImageUrl(imgUrl: string): boolean {
    const postImagePattern = /https:\/\/pic\.nijie\.net\/.*\.jpg/;

    return postImagePattern.test(imgUrl);
  }

  async generateZip(options: DownloadOptions = {}): Promise<Blob> {
    const imgUrls = this.extractPostImageLinks();

    if (imgUrls.length === 0) {
      throw new Error("画像が見つかりませんでした");
    }

    this.currentStatus.total = imgUrls.length;
    this.currentStatus.done = 0;
    this.currentStatus.zip = 0;

    const zip = new JSZip();
    const extension = options.imageExtension || "jpg";

    // NOTE: should avoid `foreach`.
    // https://zenn.dev/wintyo/articles/2973f15a265581
    for (let i = 0; i < imgUrls.length; i++) {
      const imgUrl = imgUrls[i];
      try {
        const blob = await GMFetch(imgUrl, {
          responseType: "arraybuffer",
        });
        const name = `${i}.${extension}`;
        zip.file(name, blob);
        this.currentStatus.done++;
      } catch (error) {
        console.error(`画像のダウンロードに失敗しました: ${imgUrl}`, error);
        throw new Error(`画像のダウンロードに失敗しました: ${imgUrl}`);
      }
    }

    const bin = await zip.generateAsync({ type: "blob" }, (metadata) => {
      this.currentStatus.zip = metadata.percent;
    });

    return bin;
  }

  async downloadPost(options: DownloadOptions = {}): Promise<void> {
    const bin = await this.generateZip(options);

    let filename = options.filename;
    if (!filename) {
      const title = this.document.head
        ?.querySelector("title")
        ?.textContent?.trim();
      filename = title ? `${title}.zip` : "download.zip";
    }

    // fire the download
    const dl = this.document.createElement("a");
    dl.href = URL.createObjectURL(bin);
    dl.download = filename;
    this.document.body.append(dl);
    dl.click();
    dl.remove();
  }

  getStatus(): DownloadStatus {
    return { ...this.currentStatus };
  }
}
