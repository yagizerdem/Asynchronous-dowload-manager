const https = require("https");
const fs = require("fs").promises;
const { createWriteStream } = require("fs");
const path = require("path");
const dirname = "downloads";
const directoryPath = path.join(process.cwd(), dirname);
async function downloadHelper(url, callback) {
  await checkDownloadsPath();
  const filename = path.basename(url);
  const filePath = path.join(directoryPath, filename);

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download file: ${res.statusCode}`));
          return;
        }

        const totalSize = parseInt(res.headers["content-length"], 10);
        let downloadedSize = 0;
        let mimeType = res.headers["content-type"];

        const fileStream = createWriteStream(filePath);
        res.pipe(fileStream);

        res.on("data", (chunk) => {
          downloadedSize += chunk.length;
          const percentage = ((downloadedSize / totalSize) * 100).toFixed(2);
          callback(percentage);
        });

        fileStream.on("finish", () => {
          fileStream.close();
          console.log("Download finished");
          resolve({ mimeType, filename, directoryPath, downloadedSize });
        });

        fileStream.on("error", (err) => {
          reject(new Error(`Error writing to file: ${err.message}`));
        });
      })
      .on("error", (err) => {
        reject(new Error(`Error with request: ${err.message}`));
      });
  });
}

async function checkDownloadsPath() {
  try {
    // Check if the directory exists
    await fs.access(directoryPath);
    console.log(`Directory already exists: ${directoryPath}`);
  } catch (err) {
    // If the directory does not exist, create it
    if (err.code === "ENOENT") {
      try {
        await fs.mkdir(directoryPath, { recursive: true });
        console.log(`Directory created successfully: ${directoryPath}`);
      } catch (mkdirErr) {
        console.error(`Error creating directory: ${mkdirErr.message}`);
      }
    } else {
      console.error(`Error accessing directory: ${err.message}`);
    }
  }
}

module.exports = { downloadHelper };
