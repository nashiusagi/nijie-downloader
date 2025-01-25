import { DownloadManager } from "./DownloadManager";

const tailButtons = document.getElementById("view-center-button");

const downloadButton = document.createElement("button");
downloadButton.innerHTML = "Download";
downloadButton.addEventListener("click", async (event) => {
  const downloadManager = new DownloadManager();
  await downloadManager.downloadPost();
});

tailButtons?.appendChild(downloadButton);
