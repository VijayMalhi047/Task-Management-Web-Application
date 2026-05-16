// config/database.js
// ─────────────────────────────────────────────────────────────
// PERSISTENCE: sql.js — a pure JavaScript port of SQLite.
// No native compilation required. The database is a binary .sqlite
// file on disk, loaded into memory on startup and flushed after
// every write. This is real SQL — real SQLite — just loaded via JS.
//
// WHY sql.js OVER better-sqlite3?
// better-sqlite3 requires node-gyp + Python + C++ build tools.
// sql.js is compiled to WebAssembly and has zero native dependencies.
// The trade-off: we manually flush to disk after writes (better-sqlite3
// does this automatically). For a single-user local app, this is fine.
// ─────────────────────────────────────────────────────────────

const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");

// ─── PATHS (SERVERLESS SAFEQUARD INTEGRATED) ──────────────────
// Netlify Functions run on a read-only file system. The only directory 
// where AWS Lambda permits file attachments and write calls is /tmp.
const isServerless = process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT;
const DB_DIR = isServerless ? "/tmp" : path.join(__dirname, "../db");
const DB_PATH = path.join(DB_DIR, "tasks.sqlite");
// ─────────────────────────────────────────────────────────────

// ─── MODULE-LEVEL DB REFERENCE ────────────────────────────────
// Holds the live sql.js Database instance once initialized.
// Exported functions below close over this reference.
let db = null;

// ─── FLUSH TO DISK ────────────────────────────────────────────
// sql.js keeps the database in memory. After every write we call
// this to persist the binary buffer back to the .sqlite file.
// This is what better-sqlite3 does automatically under the hood.
const flushToDisk = () => {
  const data = db.export();                        // Returns Uint8Array
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

// ─── INITIALIZE ───────────────────────────────────────────────
// Returns a Promise — must be awaited in server.js before the
// Express app starts accepting requests. This ensures the DB
// is ready before any route handler can run.
// Inside backend/config/database.js

const initializeStore = async () => {
  fs.mkdirSync(DB_DIR, { recursive: true });

  const config = isServerless
    ? { locateFile: file => `https://sql.js.org/dist/${file}` }
    : {};

  const SQL = await initSqlJs(config); // Load the WebAssembly module with cloud fallback

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log(`[DB] Loaded existing SQLite database at: ${DB_PATH}`);
  } else {
    db = new SQL.Database();
    console.log(`[DB] Created new SQLite database in memory space.`);
  }

  // ... (keep your table schema code exactly the same below)

  // ── SCHEMA ────────────────────────────────────────────────
  // CREATE TABLE IF NOT EXISTS is idempotent — safe on every restart.
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
  console.log("[DB] Schema initialized successfully.");
};

// ─── QUERY HELPERS ────────────────────────────────────────────
// sql.js returns results as [{ columns: [...], values: [[...]] }].
// These helpers convert that format into plain JS object arrays,
// the same shape our controllers already expect.

/**
 * Run a SELECT query. Returns an array of plain objects.
 */
const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  const results = [];
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

/**
 * Run an INSERT / UPDATE / DELETE.
 * Returns { lastInsertRowid, changes }.
 */
const run = (sql, params = []) => {
  db.run(sql, params);
  // lastInsertRowid and changes tracked via these queries
  const [{ "last_insert_rowid()": lastInsertRowid }] =
    query("SELECT last_insert_rowid()");
  const [{ "changes()": changes }] =
    query("SELECT changes()");
  flushToDisk();   // Persist every write immediately
  return { lastInsertRowid, changes };
};

module.exports = { initializeStore, query, run };