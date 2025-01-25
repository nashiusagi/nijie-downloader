import { DownloadManager } from "./DownloadManager";
import { test, expect, describe } from "vitest";

describe("DownloadManagerのテスト", () => {
  test("extractPostImageLinksのテスト", () => {
    const inputHTMLString = `
      <div>
        <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample_2.jpg">
      </div>
    `;
    document.body.innerHTML = inputHTMLString;
    const _this = globalThis;
    _this.document ??= document;

    const downloadManager = new DownloadManager();

    const expected = [
      "https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg",
      "https://pic.nijie.net/01/nijie/test/00/000000/illust/sample_2.jpg",
    ];

    const result = downloadManager.extractPostImageLinks();

    expect(result).toEqual(expected);
  });
});
