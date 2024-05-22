const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { downloadHelper } = require("./downloadHelper");
var moment = require("moment");
const { Item } = require("./Item");
const { createDb, insertToDb: insert, fetchData } = require("./util");
let win;
const createWindow = async () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: false, // Disable node integration to enforce web security
      contextIsolation: true, // Enable context isolation for better security
      sandbox: true, // Enable sandbox mode
      allowRunningInsecureContent: false, // Disallow insecure content
      webSecurity: true, // Enable web security
      preload: path.join(__dirname, "preload.js"),
    },
  });
  ipcMain.on("startdownload", async (event, uri) => {
    const percentageCallback = (percentage) => {
      event.sender.send("update-percentage", percentage);
    };

    try {
      const { mimeType, filename, directoryPath, downloadedSize } =
        await downloadHelper(uri, percentageCallback);
      insertToDb({ mimeType, filename, directoryPath, downloadedSize, uri });
      event.sender.send("download-complete", mimeType);
    } catch (error) {
      console.error("Error during download:", error);
      event.sender.send("download-error", error.message);
    }
  });
  ipcMain.on("fetchDocuments", async (event, filter) => {
    let data = await fetchData();
    data = filter ? data.filter((doc) => doc.mimeType == filter) : data;
    event.sender.send("sendDocuments", data);
  });

  win.loadFile("index.html");
};

app.whenReady().then(async () => {
  createDb();
  createWindow();
  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  const initialData = await fetchData();
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("initial-data", initialData);
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function insertToDb({
  mimeType,
  filename,
  directoryPath,
  downloadedSize,
  uri,
}) {
  mimeType = mimeType.split("/")[0];
  const dateTimeNow = moment().format("yyyy-mm-dd:hh:mm:ss");
  const item = new Item({
    filename,
    mimeType,
    tryDate: dateTimeNow,
    size: downloadedSize,
    path: directoryPath,
    uri,
  });
  insert(item);
}
