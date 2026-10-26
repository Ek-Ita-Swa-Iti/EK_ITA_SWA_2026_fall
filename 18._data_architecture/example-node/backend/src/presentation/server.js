// Presentation layer: receives HTTP requests, renders JSON responses.
//
// Every write goes to MySQL first (the source of truth), then to the vector
// index. Search asks the vector index for ids, then reads the notes from MySQL.

const http = require("http");
const notesRepository = require("../persistence/notesMySQLRepository");
const vectorIndex = require("../persistence/notesVectorIndex");

const PORT = process.env.PORT || 3000;

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    // The frontend runs on a separate origin (localhost:8080 vs
    // localhost:3000), so the browser enforces CORS — allow it explicitly.
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(status === 204 ? undefined : JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// Shared by POST and PUT: both take a full { title, body }.
async function readNote(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    send(res, 400, { error: "Invalid JSON body" });
    return null;
  }
  if (!body.title || !body.body) {
    send(res, 400, { error: "title and body are required" });
    return null;
  }
  return body;
}

// The note is already safe in MySQL. If the vector index fails, we log it and
// carry on — the note just won't be searchable until the index is rebuilt.
async function tryIndex(action) {
  if (!vectorIndex.isConfigured()) return;
  try {
    await action();
  } catch (err) {
    console.error(`Vector index: ${err.message}`);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return send(res, 204);
  }

  if (req.method === "GET" && url.pathname === "/v1/notes/search") {
    const q = url.searchParams.get("q");
    if (!q) return send(res, 400, { error: "q is required" });
    if (!vectorIndex.isConfigured()) {
      return send(res, 503, { error: "Vector database is not configured — see .env" });
    }
    let hits;
    try {
      hits = await vectorIndex.search(q);
    } catch (err) {
      console.error(`Vector index: ${err.message}`);
      return send(res, 502, { error: "Vector database did not answer" });
    }
    const notes = await notesRepository.findByIds(hits.map((hit) => hit.id));
    // Keep Qdrant's order (closest first), and show the score.
    const results = hits
      .map((hit) => ({ ...notes.find((note) => note.id === hit.id), score: hit.score }))
      .filter((result) => result.id !== undefined);
    return send(res, 200, results);
  }

  if (req.method === "GET" && url.pathname === "/v1/notes") {
    return send(res, 200, await notesRepository.findAll());
  }

  if (req.method === "POST" && url.pathname === "/v1/notes") {
    const body = await readNote(req, res);
    if (!body) return;
    const note = await notesRepository.create(body.title, body.body);
    await tryIndex(() => vectorIndex.index(note));
    return send(res, 201, note);
  }

  const singleNote = url.pathname.match(/^\/v1\/notes\/(\d+)$/);
  if (singleNote) {
    const id = Number(singleNote[1]);

    if (req.method === "GET") {
      const note = await notesRepository.findById(id);
      return note ? send(res, 200, note) : send(res, 404, { error: "Note not found" });
    }

    if (req.method === "PUT") {
      const body = await readNote(req, res);
      if (!body) return;
      const note = await notesRepository.update(id, body.title, body.body);
      if (!note) return send(res, 404, { error: "Note not found" });
      await tryIndex(() => vectorIndex.index(note));
      return send(res, 200, note);
    }

    if (req.method === "DELETE") {
      const removed = await notesRepository.remove(id);
      if (!removed) return send(res, 404, { error: "Note not found" });
      await tryIndex(() => vectorIndex.remove(id));
      return send(res, 204);
    }
  }

  send(res, 404, { error: "Not found" });
});

// On start: make sure the collection exists, and (re)build the index from
// MySQL. Safe to run every time — saving a note with the same id overwrites it.
async function rebuildIndex() {
  if (!vectorIndex.isConfigured()) {
    console.log("Vector database not configured — search is off. See .env.example");
    return;
  }
  try {
    await vectorIndex.ensureCollection();
    const notes = await notesRepository.findAll();
    await vectorIndex.indexAll(notes);
    console.log(`Vector index rebuilt from MySQL: ${notes.length} notes`);
  } catch (err) {
    console.error(`Vector index: ${err.message}`);
  }
}

server.listen(PORT, () => {
  console.log(`Presentation layer listening on port ${PORT}`);
  rebuildIndex();
});
