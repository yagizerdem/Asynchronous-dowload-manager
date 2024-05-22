class Item {
  constructor({ path, mimeType, tryDate, uri, filename, size }) {
    this.path = path;
    this.mimeType = mimeType;
    this.tryDate = tryDate;
    this.uri = uri;
    this.filename = filename;
    this.size = size;
  }
}
module.exports = { Item };
