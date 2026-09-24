// Persistence layer backed by MySQL — the Session 9, Part 1 live swap.
//
// Same three-function contract as notesRepository.js: findAll, findById,
// create, all async, same note shape ({ id, title, body }). server.js
// only needs its require(...) line changed to point here — nothing else.
//
// Connection settings are read from env vars. docker-compose.yml's "db"
// service sets DB_HOST=db so this resolves over the compose network — the
// localhost/root/my-secret-pw defaults below are for running the backend
// directly on the host instead, against a local MySQL container.

const mysql = require("mysql2/promise");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "my-secret-pw";
const DB_NAME = process.env.DB_NAME || "notes_db";

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The db container starts running well before MySQL is actually ready to
// accept connections, so the first connection attempt is expected to fail —
// retry for a while instead of crashing the backend on that race.
async function connectWithRetry(attempts = 15, delayMs = 2000) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
      });
    } catch (err) {
      if (attempt === attempts) throw err;
      await delay(delayMs);
    }
  }
}

// The database and table don't exist yet on a fresh container, so the first
// query prepares them — same "starts empty, works immediately" experience
// the in-memory version gives for free.
const ready = (async () => {
  const bootstrap = await connectWithRetry();
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await bootstrap.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL
    )
  `);

  const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM notes");
  if (count === 0) {
    await pool.query("INSERT INTO notes (title, body) VALUES (?, ?), (?, ?)", [
      "Welcome", "This note is read from MySQL, not hardcoded.",
      "Second note", "Swapped in by changing one require(...) line.",
    ]);
  }
})();

async function findAll() {
  await ready;
  const [rows] = await pool.query("SELECT id, title, body FROM notes");
  return rows;
}

async function findById(id) {
  await ready;
  const [rows] = await pool.query("SELECT id, title, body FROM notes WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function create(title, body) {
  await ready;
  const [result] = await pool.query("INSERT INTO notes (title, body) VALUES (?, ?)", [title, body]);
  return { id: result.insertId, title, body };
}

module.exports = { findAll, findById, create };
