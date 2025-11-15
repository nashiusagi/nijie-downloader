import { DownloadManager } from "./DownloadManager";
import { test, expect, describe, beforeEach } from "vitest";

describe("DownloadManagerのテスト", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("extractPostImageLinksのテスト - 正常なケース", () => {
    const inputHTMLString = `
      <div>
        <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample_2.jpg">
      </div>
    `;
    document.body.innerHTML = inputHTMLString;

    const downloadManager = new DownloadManager(document);

    const expected = [
      "https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg",
      "https://pic.nijie.net/01/nijie/test/00/000000/illust/sample_2.jpg",
    ];

    const result = downloadManager.extractPostImageLinks();

    expect(result).toEqual(expected);
  });

  test("extractPostImageLinksのテスト - マッチしない画像を除外", () => {
    const inputHTMLString = `
      <div>
        <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        <img src="https://example.com/image.jpg">
        <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample_2.jpg">
      </div>
    `;
    document.body.innerHTML = inputHTMLString;

    const downloadManager = new DownloadManager(document);

    const expected = [
      "https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg",
      "https://pic.nijie.net/01/nijie/test/00/000000/illust/sample_2.jpg",
    ];

    const result = downloadManager.extractPostImageLinks();

    expect(result).toEqual(expected);
  });

  test("extractPostImageLinksのテスト - 画像が存在しない場合", () => {
    document.body.innerHTML = "<div>No images here</div>";

    const downloadManager = new DownloadManager(document);

    const result = downloadManager.extractPostImageLinks();

    expect(result).toEqual([]);
  });

  test("getStatusのテスト - 初期状態", () => {
    const downloadManager = new DownloadManager(document);

    const status = downloadManager.getStatus();

    expect(status).toEqual({ done: 0, total: 0, zip: 0 });
  });
});
