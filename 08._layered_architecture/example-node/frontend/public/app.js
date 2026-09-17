// This is the browser calling the backend directly — not the frontend
// container calling it. That's why this is the published host port
// (localhost:3000), not the docker-compose service name (backend:3000):
// container-to-container names only resolve inside the Docker network,
// and the browser runs outside it. See README.md.
const BACKEND_URL = "http://localhost:3000";

fetch(`${BACKEND_URL}/notes`)
  .then((res) => res.json())
  .then((notes) => {
    const list = document.getElementById("notes");
    notes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = `${note.title}: ${note.body}`;
      list.appendChild(item);
    });
  })
  .catch((err) => {
    document.getElementById("notes").textContent = `Failed to reach backend: ${err}`;
  });
