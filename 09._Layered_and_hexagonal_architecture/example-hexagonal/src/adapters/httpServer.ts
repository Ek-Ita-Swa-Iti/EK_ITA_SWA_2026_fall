// DRIVING ADAPTER: translates HTTP into calls on the core, and the core's
// answers (and errors) back into HTTP. It knows the core — never the storage.

import http from "node:http";
import { NotesService, ValidationError } from "../core/NotesService.ts";

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJson(req: http.IncomingMessage): Promise<any> {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export function startHttpServer(service: NotesService, port: number) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const single = url.pathname.match(/^\/notes\/(\d+)$/);

    try {
      if (req.method === "GET" && url.pathname === "/notes") {
        return send(res, 200, await service.list());
      }
      if (req.method === "GET" && single) {
        const note = await service.get(Number(single[1]));
        return note ? send(res, 200, note) : send(res, 404, { error: "Note not found" });
      }
      if (req.method === "POST" && url.pathname === "/notes") {
        const { title, body } = await readJson(req);
        return send(res, 201, await service.create(title, body));
      }
      send(res, 404, { error: "Not found" });
    } catch (err) {
      if (err instanceof ValidationError) return send(res, 400, { error: err.message });
      if (err instanceof SyntaxError) return send(res, 400, { error: "Invalid JSON body" });
      send(res, 500, { error: "Internal error" });
    }
  });

  server.listen(port, () => console.log(`HTTP adapter listening on port ${port}`));
}
