// Presentation layer: receives HTTP requests, renders JSON responses.
// The only file that imports persistence — see README.md's dependency table.
// Every repository call is awaited: the contract is async, so a persistence
// layer backed by a database or a remote API can be swapped in without
// changing anything below the require line.

const http = require("http");
const notesRepository = require("../persistence/notesMongoDBRepository");

const PORT = process.env.PORT || 3000;

function send(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    // Swagger UI runs on a separate origin (localhost:8081 vs localhost:3000)
    // and its "Try it out" button calls this API from the browser — the
    // browser enforces CORS, so the presentation layer has to allow it.
    "Access-Control-Allow-Origin": "*",
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

// 204 means "done, nothing to send back" — so no body and no Content-Type.
function sendNoContent(res) {
  res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
  res.end();
}

// 405, not 404: the path exists, just not with this method. The Allow header
// tells the client which methods it can use instead.
function sendMethodNotAllowed(res, allowed) {
  send(res, 405, { error: "Method not allowed" }, { Allow: allowed });
}

// A POST with a JSON body makes the browser send an OPTIONS "preflight"
// first. Without this answer, "Try it out" in Swagger UI fails on POST.
function sendPreflight(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

function isJson(req) {
  return (req.headers["content-type"] || "").startsWith("application/json");
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

// Shared by POST and PUT: both take a full note as JSON. Sends the error
// response itself and returns null, so the caller just returns.
async function readNoteInput(req, res) {
  if (!isJson(req)) {
    send(res, 415, { error: "Content-Type must be application/json" });
    return null;
  }
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    send(res, 400, { error: "Invalid JSON body" });
    return null;
  }
  if (typeof body?.title !== "string" || typeof body?.body !== "string" || !body.title || !body.body) {
    send(res, 400, { error: "title and body are required" });
    return null;
  }
  return { title: body.title, body: body.body };
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return sendPreflight(res);
  }

  if (req.method === "GET" && url.pathname === "/v1/notes") {
    return send(res, 200, await notesRepository.findAll());
  }

  if (req.method === "POST" && url.pathname === "/v1/notes") {
    const input = await readNoteInput(req, res);
    if (!input) return;
    const note = await notesRepository.create(input.title, input.body);
    return send(res, 201, note);
  }

  if (url.pathname === "/v1/notes") {
    return sendMethodNotAllowed(res, "GET, POST, OPTIONS");
  }

  const singleNote = url.pathname.match(/^\/v1\/notes\/([^/]+)$/);
  if (singleNote) {
    // The path matches, but "abc" or "0" can never be a note id: that is a
    // malformed request (400), not a note that happens to be missing (404).
    const id = Number(singleNote[1]);
    if (!Number.isInteger(id) || id < 1) {
      return send(res, 400, { error: "id must be a positive integer" });
    }

    if (req.method === "GET") {
      const note = await notesRepository.findById(id);
      return note ? send(res, 200, note) : send(res, 404, { error: "Note not found" });
    }

    // PUT replaces the whole note, so title and body are both required —
    // the same rules as POST. A partial update would be PATCH.
    if (req.method === "PUT") {
      const input = await readNoteInput(req, res);
      if (!input) return;
      const note = await notesRepository.update(id, input.title, input.body);
      return note ? send(res, 200, note) : send(res, 404, { error: "Note not found" });
    }

    if (req.method === "DELETE") {
      const deleted = await notesRepository.remove(id);
      return deleted ? sendNoContent(res) : send(res, 404, { error: "Note not found" });
    }

    return sendMethodNotAllowed(res, "GET, PUT, DELETE, OPTIONS");
  }

  send(res, 404, { error: "Not found" });
}

// If the database is down, the repository throws. Answer with a 500 the
// spec can describe, instead of letting the error crash the whole server.
const server = http.createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (err) {
    console.error(err);
    send(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Presentation layer listening on port ${PORT}`);
});
