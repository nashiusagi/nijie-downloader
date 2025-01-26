import { DownloadManager } from "./DownloadManager";
import { PostDownloadButton } from "./PostDownloadButton";

const downloadManager = new DownloadManager();

const tailButtons = document.getElementById("view-center-button");
const postDownloadButton = new PostDownloadButton(downloadManager);
tailButtons?.appendChild(postDownloadButton.button);
