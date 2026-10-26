// Persistence: MySQL — the source of truth. Every page lives here, as text.
//
// The search functions return the exact SQL they ran, so the frontend can
// show it. mysql2's pool.query() fills in the ? placeholders itself before
// sending, and pool.format() gives us that same string.

const mysql = require("mysql2/promise");
const seedPages = require("./seedPages");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "my-secret-pw";
const DB_NAME = process.env.DB_NAME || "search_db";

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 5,
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The mysql container starts well before MySQL accepts connections,
// so retry for a while instead of crashing on that race.
async function connectWithRetry(attempts = 30, delayMs = 2000) {
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

const ready = (async () => {
  const bootstrap = await connectWithRetry();
  // Danish collation: LIKE ignores upper/lower case, and æ, ø, å sort right.
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_danish_ci`,
  );
  await bootstrap.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      url VARCHAR(255) NOT NULL,
      body TEXT NOT NULL
    )
  `);

  const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM pages");
  if (count === 0) {
    await pool.query("INSERT INTO pages (title, url, body) VALUES ?", [seedPages]);
  }
})();

async function run(sql, params) {
  await ready;
  const statement = pool.format(sql, params);
  const started = Date.now();
  const [rows] = await pool.query(statement);
  return { statement, rows, ms: Date.now() - started };
}

// Text search: does the title or the body contain these exact letters?
async function search(text) {
  const pattern = `%${text}%`;
  return run(
    "SELECT id, title, url, body FROM pages WHERE title LIKE ? OR body LIKE ? LIMIT 10",
    [pattern, pattern],
  );
}

async function findByIds(ids) {
  if (ids.length === 0) return { statement: "", rows: [], ms: 0 };
  return run("SELECT id, title, url, body FROM pages WHERE id IN (?)", [ids]);
}

async function findAll() {
  return (await run("SELECT id, title, url, body FROM pages ORDER BY id")).rows;
}

async function create(title, url, body) {
  await ready;
  const [result] = await pool.query("INSERT INTO pages (title, url, body) VALUES (?, ?, ?)", [title, url, body]);
  return { id: result.insertId, title, url, body };
}

module.exports = { search, findByIds, findAll, create };
