// config/database.js
const path    = require("path");
const fs      = require("fs");
const initSqlJs = require("sql.js");

// Redirect write paths to /tmp memory when executing on cloud nodes
const isServerless = process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT;
const DB_DIR  = isServerless ? "/tmp" : path.join(__dirname, "../db");
const DB_PATH = path.join(DB_DIR, "tasks.sqlite");

let db = null;

const flushToDisk = () => {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

const initializeStore = async () => {
  // Prevent double-initialization runtime locks
  if (db) return;

  fs.mkdirSync(DB_DIR, { recursive: true });

  // Load the WebAssembly engine natively from the unbundled module directory
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log(`[DB] Loaded SQLite instance from cache: ${DB_PATH}`);
  } else {
    db = new SQL.Database();
    console.log("[DB] Initialized fresh SQLite memory space.");
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      otp           TEXT,
      otp_expires   INTEGER,
      verified      INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      priority    TEXT    CHECK(priority IN ('Low','Medium','High')) DEFAULT 'Medium',
      status      TEXT    CHECK(status IN ('pending','completed')) DEFAULT 'pending',
      created_at  TEXT    DEFAULT (datetime('now')),
      user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  flushToDisk();
  console.log("[DB] Relational structural maps compiled.");
};

const query = (sql, params = []) => {
  const stmt    = db.prepare(sql);
  const results = [];
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

const run = (sql, params = []) => {
  db.run(sql, params);
  const [{ "last_insert_rowid()": lastInsertRowid }] = query("SELECT last_insert_rowid()");
  const [{ "changes()": changes }] = query("SELECT changes()");
  flushToDisk();
  return { lastInsertRowid, changes };
};

module.exports = { initializeStore, query, run };