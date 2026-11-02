// Presentation layer: HTTP in, JSON out. It only talks to the application
// layer — it doesn't know that MySQL or Qdrant exist.

const http = require("http");
const searchService = require("../application/searchService");

const PORT = process.env.PORT || 3000;

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    // The frontend runs on a separate origin (localhost:8080 vs
    // localhost:3000), so the browser enforces CORS — allow it explicitly.
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return send(res, 204);
  }

  if (req.method === "GET" && url.pathname === "/v1/search") {
    const q = url.searchParams.get("q")?.trim();
    if (!q) return send(res, 400, { error: "q is required" });
    return send(res, 200, await searchService.search(q));
  }

  if (req.method === "GET" && url.pathname === "/v1/pages") {
    return send(res, 200, await searchService.listPages());
  }

  if (req.method === "POST" && url.pathname === "/v1/pages") {
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return send(res, 400, { error: "Invalid JSON body" });
    }
    if (!body.title || !body.url || !body.body) {
      return send(res, 400, { error: "title, url and body are required" });
    }
    return send(res, 201, await searchService.addPage(body.title, body.url, body.body));
  }

  send(res, 404, { error: "Not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (err) {
    // A database that's down shouldn't take the whole backend with it.
    console.error(err);
    send(res, 502, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Presentation layer listening on port ${PORT}`);
});
