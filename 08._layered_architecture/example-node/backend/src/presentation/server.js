// Presentation layer: receives HTTP requests, renders JSON responses.
// The only file that imports persistence — see README.md's dependency table.

const http = require("http");
const notesRepository = require("../persistence/notesRepository");

const PORT = process.env.PORT || 3000;

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    // The frontend runs in a separate container on a separate origin
    // (localhost:8080 vs localhost:3000) — the browser enforces CORS,
    // so the presentation layer has to allow it explicitly.
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/notes") {
    return send(res, 200, notesRepository.findAll());
  }

  const singleNote = url.pathname.match(/^\/notes\/(\d+)$/);
  if (req.method === "GET" && singleNote) {
    const note = notesRepository.findById(Number(singleNote[1]));
    return note ? send(res, 200, note) : send(res, 404, { error: "Note not found" });
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Presentation layer listening on port ${PORT}`);
});
