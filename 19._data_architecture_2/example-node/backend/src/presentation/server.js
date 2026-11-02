// Presentation layer: receives HTTP requests, renders JSON responses.
// The only file that imports persistence — see README.md.
// Every repository call is awaited: the contract is async, so a persistence
// layer backed by a database or a remote API can be swapped in without
// changing anything below the require line.

const http = require("http");
const notesRepository = require("../persistence/notesMongoDBRepository");

const PORT = process.env.PORT || 3000;

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    // The frontend runs on a separate origin (localhost:8080 vs
    // localhost:3000), so the browser enforces CORS — allow it explicitly,
    // including the methods and header a preflight asks about.
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return send(res, 204);
  }

  if (req.method === "GET" && url.pathname === "/v1/notes") {
    return send(res, 200, await notesRepository.findAll());
  }

  if (req.method === "POST" && url.pathname === "/v1/notes") {
    const body = await readNote(req, res);
    if (!body) return;
    const note = await notesRepository.create(body.title, body.body);
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
      return note ? send(res, 200, note) : send(res, 404, { error: "Note not found" });
    }

    if (req.method === "DELETE") {
      const removed = await notesRepository.remove(id);
      return removed ? send(res, 204) : send(res, 404, { error: "Note not found" });
    }
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Presentation layer listening on port ${PORT}`);
});
