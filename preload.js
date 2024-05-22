const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lib", {
  download: (uri) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once("download-complete", (_event, mimeType) => {
        resolve();
      });
      ipcRenderer.once("download-error", (_event, error) => {
        reject(error);
      });
      ipcRenderer.send("startdownload", uri);
    });
  },
  onUpdatePercentage: (callback) =>
    ipcRenderer.on("update-percentage", (_event, value) => callback(value)),
  fetchDocuments: (filter) => ipcRenderer.send("fetchDocuments", filter),
  onNewDocuments: (callback) =>
    ipcRenderer.on("sendDocuments", (_event, value) => callback(value)),
  onInitialData: (callback) =>
    ipcRenderer.on("initial-data", (event, data) => callback(data)),
});
