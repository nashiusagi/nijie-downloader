import { DownloadManager } from "./DownloadManager";
import { PostDownloadButton } from "./PostDownloadButton";

const downloadManager = new DownloadManager();

const tailButtons = document.getElementById("illust_setting");
const postDownloadButton = new PostDownloadButton(downloadManager);
tailButtons?.appendChild(postDownloadButton.button);
