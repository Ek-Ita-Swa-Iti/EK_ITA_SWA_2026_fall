# A DRIVING adapter: it drives the core. It turns HTTP requests into calls
# on NotesService, and the results back into JSON responses.

import json
from http.server import BaseHTTPRequestHandler, HTTPServer


class NotesHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        service = self.server.notes_service

        if self.path == "/notes":
            self.send_json(200, service.list_notes())
            return

        note_id = self.path.removeprefix("/notes/")
        if self.path.startswith("/notes/") and note_id.isdigit():
            note = service.get_note(int(note_id))
            if note is None:
                self.send_json(404, {"error": "Note not found"})
            else:
                self.send_json(200, note)
            return

        self.send_json(404, {"error": "Not found"})

    def do_POST(self):
        service = self.server.notes_service

        if self.path != "/notes":
            self.send_json(404, {"error": "Not found"})
            return

        length = int(self.headers.get("Content-Length", 0))
        try:
            data = json.loads(self.rfile.read(length))
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON body"})
            return

        try:
            note = service.create_note(data.get("title", ""), data.get("body", ""))
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        self.send_json(201, note)

    def send_json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def serve(notes_service, port):
    server = HTTPServer(("", port), NotesHandler)
    server.notes_service = notes_service
    print(f"Notes API listening on http://localhost:{port}", flush=True)
    server.serve_forever()
