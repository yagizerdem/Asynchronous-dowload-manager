let gridApi;
let downloadBtn;
let urlbar;
const downloadQueue = [];
let isDownloading = false;
let grid;
let rowData = [];
let filterbtns = [];
let inputTypeRange = null;
const types = {
  audio: "audio",
  text: "text",
  all: null,
  compressed: "application",
  image: "image",
};
let filterType = null;
window.onload = () => {
  downloadBtn = document.getElementById("downloadBtn");
  inputTypeRange = document.getElementById("progressbar");
  urlbar = document.getElementById("urlbar");
  filterbtns = [...document.querySelectorAll(".left")[0].children];
  filterbtns.forEach((item) =>
    item.addEventListener("click", () => changeFilter(item.innerHTML))
  );
  downloadBtn.addEventListener("click", async () => {
    handleDownload(urlbar.value);
  });

  const gridOptions = {
    // Row Data: The data to be displayed.
    rowData: rowData,
    // Column Definitions: Defines the columns to be displayed.
    columnDefs: [
      { field: "path" },
      { field: "filename" },
      { field: "uri" },
      { field: "size" },
      { field: "tryDate" },
      { field: "mimeType" },
    ],
  };
  // creating grid
  gridDiv = document.getElementById("myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);
  agGrid.createGrid(grid, gridOptions);
};

async function handleDownload(url) {
  downloadQueue.push(url);
  if (!isDownloading) {
    isDownloading = true;
    await startNextDownload();
  }
}

async function startNextDownload() {
  if (downloadQueue.length === 0) {
    isDownloading = false;
    return;
  }

  const url = downloadQueue.shift();

  try {
    await window.lib.download(url);
  } catch (error) {
    console.error("Error during download:", error);
  } finally {
    window.lib.fetchDocuments(filterType);
    await startNextDownload();
  }
}

window.lib.onUpdatePercentage((value) => {
  // update status bar
  // console.log(value);
  inputTypeRange.value = value;
  if (value * 1 == 100) inputTypeRange.value = 0;
});
window.lib.onNewDocuments((data) => {
  const newrowData = data.map((item) => item);
  gridApi.setGridOption("rowData", newrowData);
});
window.lib.onInitialData((data) => {
  const newrowData = data.map((item) => item);
  gridApi.setGridOption("rowData", newrowData);
});
function changeFilter(filter) {
  filterType = types[filter];
  const data = window.lib.fetchDocuments(filterType);
}
