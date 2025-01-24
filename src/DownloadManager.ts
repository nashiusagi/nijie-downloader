export class DownloadManager {
  private imgElements: Array<HTMLImageElement>;

  constructor() {
    this.imgElements = Array.from(document.getElementsByTagName("img"));
    console.log(this.imgElements.length);
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
}
