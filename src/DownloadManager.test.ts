import { DownloadManager } from "./DownloadManager";
import { test, expect, describe, beforeEach, vi } from "vitest";
import GMFetch from "./libs/GMFetch";
import JSZip from "jszip";

// GMFetchをモック
vi.mock("./libs/GMFetch", () => ({
  default: vi.fn(),
}));

// JSZipをモック
vi.mock("jszip");

interface MockJSZipInstance {
  file: ReturnType<typeof vi.fn>;
  generateAsync: ReturnType<typeof vi.fn>;
}

describe("DownloadManager", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("extractPostImageLinks", () => {
    test("正常なケース - nijie.netの画像URLを抽出", () => {
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

    test("マッチしない画像を除外", () => {
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

    test("画像が存在しない場合は空配列を返す", () => {
      document.body.innerHTML = "<div>No images here</div>";

      const downloadManager = new DownloadManager(document);

      const result = downloadManager.extractPostImageLinks();

      expect(result).toEqual([]);
    });
  });

  describe("getStatus", () => {
    test("初期状態のステータスを返す", () => {
      const downloadManager = new DownloadManager(document);

      const status = downloadManager.getStatus();

      expect(status).toEqual({ done: 0, total: 0, zip: 0 });
    });
  });

  describe("generateZip", () => {
    test("正常なケース - 複数画像をZIPファイルに圧縮", async () => {
      const inputHTMLString = `
        <div>
          <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
          <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample2.jpg">
        </div>
      `;
      document.body.innerHTML = inputHTMLString;

      // GMFetchのモック設定
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      vi.mocked(GMFetch).mockResolvedValue(mockBlob as never);

      // JSZipのモック設定
      const mockFile = vi.fn();
      const mockGenerateAsync = vi
        .fn()
        .mockImplementation((options, callback) => {
          if (callback) {
            callback({ percent: 100 });
          }
          return Promise.resolve(
            new Blob(["zip"], { type: "application/zip" }),
          );
        });
      vi.mocked(JSZip).mockImplementation(function (this: MockJSZipInstance) {
        this.file = mockFile;
        this.generateAsync = mockGenerateAsync;
        return this;
      } as never);

      const downloadManager = new DownloadManager(document);
      const result = await downloadManager.generateZip();

      expect(result).toBeInstanceOf(Blob);
      expect(GMFetch).toHaveBeenCalledTimes(2);
      expect(mockFile).toHaveBeenCalledTimes(2);
      expect(mockFile).toHaveBeenCalledWith("0.jpg", mockBlob);
      expect(mockFile).toHaveBeenCalledWith("1.jpg", mockBlob);
      expect(mockGenerateAsync).toHaveBeenCalledTimes(1);

      const status = downloadManager.getStatus();
      expect(status.done).toBe(2);
      expect(status.total).toBe(2);
      expect(status.zip).toBe(100);
    });

    test("画像拡張子のカスタマイズ", async () => {
      const inputHTMLString = `
        <div>
          <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        </div>
      `;
      document.body.innerHTML = inputHTMLString;

      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      vi.mocked(GMFetch).mockResolvedValue(mockBlob as never);

      const mockFile = vi.fn();
      const mockGenerateAsync = vi
        .fn()
        .mockResolvedValue(new Blob(["zip"], { type: "application/zip" }));
      vi.mocked(JSZip).mockImplementation(function (this: MockJSZipInstance) {
        this.file = mockFile;
        this.generateAsync = mockGenerateAsync;
        return this;
      } as never);

      const downloadManager = new DownloadManager(document);
      await downloadManager.generateZip({ imageExtension: "png" });

      expect(mockFile).toHaveBeenCalledWith("0.png", mockBlob);
    });

    test("画像が見つからない場合はエラーをスロー", async () => {
      document.body.innerHTML = "<div>No images here</div>";

      const downloadManager = new DownloadManager(document);

      await expect(downloadManager.generateZip()).rejects.toThrow(
        "画像が見つかりませんでした",
      );
    });

    test("画像ダウンロード失敗時はエラーをスロー", async () => {
      const inputHTMLString = `
        <div>
          <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        </div>
      `;
      document.body.innerHTML = inputHTMLString;

      // GMFetchがエラーを投げるようにモック
      vi.mocked(GMFetch).mockRejectedValue(new Error("Network error"));

      const mockFile = vi.fn();
      const mockGenerateAsync = vi.fn();
      vi.mocked(JSZip).mockImplementation(function (this: MockJSZipInstance) {
        this.file = mockFile;
        this.generateAsync = mockGenerateAsync;
        return this;
      } as never);

      const downloadManager = new DownloadManager(document);

      await expect(downloadManager.generateZip()).rejects.toThrow(
        "画像のダウンロードに失敗しました",
      );
    });
  });

  describe("downloadPost", () => {
    test("デフォルトのファイル名でダウンロード", async () => {
      const inputHTMLString = `
        <div>
          <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        </div>
      `;
      document.body.innerHTML = inputHTMLString;
      document.head.innerHTML = "";

      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      vi.mocked(GMFetch).mockResolvedValue(mockBlob as never);

      const mockFile = vi.fn();
      const mockGenerateAsync = vi
        .fn()
        .mockResolvedValue(new Blob(["zip"], { type: "application/zip" }));
      vi.mocked(JSZip).mockImplementation(function (this: MockJSZipInstance) {
        this.file = mockFile;
        this.generateAsync = mockGenerateAsync;
        return this;
      } as never);

      // DOM操作のモック
      const mockClick = vi.fn();
      const mockRemove = vi.fn();
      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
        remove: mockRemove,
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as never);
      const mockAppend = vi.spyOn(document.body, "append").mockImplementation();

      const downloadManager = new DownloadManager(document);
      await downloadManager.downloadPost();

      expect(mockAnchor.download).toBe("download.zip");
      expect(mockClick).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockAppend).toHaveBeenCalledWith(mockAnchor);
    });

    test("head.titleからファイル名を取得", async () => {
      const inputHTMLString = `
        <div>
          <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        </div>
      `;
      document.body.innerHTML = inputHTMLString;
      document.head.innerHTML = "<title>テスト作品タイトル</title>";

      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      vi.mocked(GMFetch).mockResolvedValue(mockBlob as never);

      const mockFile = vi.fn();
      const mockGenerateAsync = vi
        .fn()
        .mockResolvedValue(new Blob(["zip"], { type: "application/zip" }));
      vi.mocked(JSZip).mockImplementation(function (this: MockJSZipInstance) {
        this.file = mockFile;
        this.generateAsync = mockGenerateAsync;
        return this;
      } as never);

      const mockClick = vi.fn();
      const mockRemove = vi.fn();
      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
        remove: mockRemove,
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as never);
      vi.spyOn(document.body, "append").mockImplementation();

      const downloadManager = new DownloadManager(document);
      await downloadManager.downloadPost();

      expect(mockAnchor.download).toBe("テスト作品タイトル.zip");
    });

    test("カスタムファイル名でダウンロード", async () => {
      const inputHTMLString = `
        <div>
          <img src="https://pic.nijie.net/01/nijie/test/00/000000/illust/sample1.jpg">
        </div>
      `;
      document.body.innerHTML = inputHTMLString;

      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      vi.mocked(GMFetch).mockResolvedValue(mockBlob as never);

      const mockFile = vi.fn();
      const mockGenerateAsync = vi
        .fn()
        .mockResolvedValue(new Blob(["zip"], { type: "application/zip" }));
      vi.mocked(JSZip).mockImplementation(function (this: MockJSZipInstance) {
        this.file = mockFile;
        this.generateAsync = mockGenerateAsync;
        return this;
      } as never);

      const mockClick = vi.fn();
      const mockRemove = vi.fn();
      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
        remove: mockRemove,
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as never);
      vi.spyOn(document.body, "append").mockImplementation();

      const downloadManager = new DownloadManager(document);
      await downloadManager.downloadPost({ filename: "custom-name.zip" });

      expect(mockAnchor.download).toBe("custom-name.zip");
    });
  });
});
