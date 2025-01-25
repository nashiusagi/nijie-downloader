const tailButtons = document.getElementById("view-center-button");

const downloadButton = document.createElement("button");
downloadButton.innerHTML = "Download";
downloadButton.addEventListener("click", (event) => {
  alert("Hello UserScript!");
});

tailButtons?.appendChild(downloadButton);
