// Persistence layer backed by MySQL — the source of truth for notes.
//
// Contract: findAll, findById, findByIds, create, update, remove, all async,
// same note shape ({ id, title, body }).
//
// Connection settings are read from env vars. docker-compose.yml sets
// DB_HOST=mysql so this resolves over the compose network.

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
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 5,
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The mysql container starts running well before MySQL accepts
// connections, so retry for a while instead of crashing on that race.
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

// None of the notes mention "kaffe", on purpose — a search for it should
// still find the espresso note. That's the whole point of Session 18.
const SEED = [
  ["Espresso", "Maskinen skal afkalkes"],
  ["Indkøb", "Mælk og brød"],
  ["Møde", "Flyttet til torsdag"],
  ["Træning", "Løb 5 km i Fælledparken"],
  ["Ferie", "Flybilletter til Rom er booket"],
  ["Bilen", "Dækkene skal skiftes til vinterdæk"],
  ["Fødselsdag", "Køb en gave til mor"],
  ["Regninger", "Husk at betale el og internet"],
];

const ready = (async () => {
  const bootstrap = await connectWithRetry();
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_danish_ci`,
  );
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
    await pool.query("INSERT INTO notes (title, body) VALUES ?", [SEED]);
  }
})();

async function findAll() {
  await ready;
  const [rows] = await pool.query("SELECT id, title, body FROM notes ORDER BY id");
  return rows;
}

async function findById(id) {
  await ready;
  const [rows] = await pool.query("SELECT id, title, body FROM notes WHERE id = ?", [id]);
  return rows[0] ?? null;
}

async function findByIds(ids) {
  await ready;
  if (ids.length === 0) return [];
  const [rows] = await pool.query("SELECT id, title, body FROM notes WHERE id IN (?)", [ids]);
  return rows;
}

async function create(title, body) {
  await ready;
  const [result] = await pool.query("INSERT INTO notes (title, body) VALUES (?, ?)", [title, body]);
  return { id: result.insertId, title, body };
}

async function update(id, title, body) {
  await ready;
  const [result] = await pool.query("UPDATE notes SET title = ?, body = ? WHERE id = ?", [title, body, id]);
  return result.affectedRows === 1 ? { id, title, body } : null;
}

async function remove(id) {
  await ready;
  const [result] = await pool.query("DELETE FROM notes WHERE id = ?", [id]);
  return result.affectedRows === 1;
}

module.exports = { findAll, findById, findByIds, create, update, remove };
