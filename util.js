const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
var db;
const dbFileName = "app.db";

const createTableSql = `
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  mimeType TEXT,
  tryDate TEXT NOT NULL,
  uri TEXT NOT NULL,
  filename TEXT NOT NULL,
  size DOUBLE
)
`;

function insertToDb(item) {
  const sql = `
    INSERT INTO items (path, mimeType, tryDate, uri, filename, size)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    item.path,
    item.mimeType,
    item.tryDate,
    item.uri,
    item.filename,
    item.size,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Error inserting item:", err.message);
    } else {
      console.log("Item inserted successfully with ID:", this.lastID);
    }
  });
}

function createDb() {
  const files = fs.readdirSync(process.cwd());
  if (!files.includes(dbFileName)) {
    var createStream = fs.createWriteStream(dbFileName);
    createStream.end();
    db = new sqlite3.Database("app.db");

    db.run(createTableSql, (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Table created successfully.");
      }
    });
  } else {
    db = new sqlite3.Database("app.db");
  }
}

function fetchData(filter) {
  return new Promise((resolve, reject) => {
    const tableName = "items";
    const dbPath = path.join(process.cwd(), "app.db");
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        return reject(`Error opening database: ${err.message}`);
      }
    });

    const query = `SELECT * FROM ${tableName}`;
    let results = [];

    db.all(query, [], (err, rows) => {
      if (err) {
        return reject(`Error executing query: ${err.message}`);
      }

      results = rows;
      db.close((err) => {
        if (err) {
          return reject(`Error closing database: ${err.message}`);
        }
        resolve(results);
      });
    });
  });
}
module.exports = { insertToDb, createDb, fetchData };
