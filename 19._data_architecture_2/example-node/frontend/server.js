// Not part of the layered story — just a plain static file server so the
// frontend can run as its own Docker image. Everything interesting is in
// public/app.js, which fetches the backend directly from the browser.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, "public");
const CONTENT_TYPES = { ".html": "text/html", ".js": "text/javascript" };

const server = http.createServer((req, res) => {
  const filePath = req.url === "/" ? "/index.html" : req.url;
  const fullPath = path.join(PUBLIC_DIR, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const contentType = CONTENT_TYPES[path.extname(fullPath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Frontend listening on port ${PORT}`);
});
