// Presentation layer: receives HTTP requests, renders JSON responses.
// The only file that imports persistence — see README.md's dependency table.
// Every repository call is awaited: the contract is async, so a persistence
// layer backed by a database or a remote API can be swapped in without
// changing anything below the require line.

const http = require("http");
const notesRepository = require("../persistence/notesMongoDBRepository");

const PORT = process.env.PORT || 3000;

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    // Swagger UI runs on a separate origin (localhost:8081 vs localhost:3000)
    // and its "Try it out" button calls this API from the browser — the
    // browser enforces CORS, so the presentation layer has to allow it.
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
}

// A POST with a JSON body makes the browser send an OPTIONS "preflight"
// first. Without this answer, "Try it out" in Swagger UI fails on POST.
function sendPreflight(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
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

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return sendPreflight(res);
  }

  if (req.method === "GET" && url.pathname === "/v1/notes") {
    return send(res, 200, await notesRepository.findAll());
  }

  if (req.method === "POST" && url.pathname === "/v1/notes") {
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return send(res, 400, { error: "Invalid JSON body" });
    }
    if (!body.title || !body.body) {
      return send(res, 400, { error: "title and body are required" });
    }
    const note = await notesRepository.create(body.title, body.body);
    return send(res, 201, note);
  }

  const singleNote = url.pathname.match(/^\/v1\/notes\/(\d+)$/);
  if (req.method === "GET" && singleNote) {
    const note = await notesRepository.findById(Number(singleNote[1]));
    return note ? send(res, 200, note) : send(res, 404, { error: "Note not found" });
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
