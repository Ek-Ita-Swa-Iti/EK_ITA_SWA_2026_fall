// This is the browser calling the backend directly — not the frontend
// container calling it. That's why this is the published host port
// (localhost:3000), not the docker-compose service name (backend:3000):
// container-to-container names only resolve inside the Docker network,
// and the browser runs outside it. See README.md.
const BACKEND_URL = "http://localhost:3000";

fetch(`${BACKEND_URL}/v1/notes`)
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

// Semantic search: GET /v1/notes/search?q=… returns the nearest notes,
// each with a score from Qdrant (higher = closer in meaning).
document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const q = document.getElementById("q").value;
  const results = document.getElementById("results");
  results.textContent = "";

  fetch(`${BACKEND_URL}/v1/notes/search?q=${encodeURIComponent(q)}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((hits) => {
      hits.forEach((hit) => {
        const item = document.createElement("li");
        item.textContent = `${hit.title}: ${hit.body} (score ${hit.score.toFixed(3)})`;
        results.appendChild(item);
      });
    })
    .catch((err) => {
      results.textContent = `Search failed: ${err.message}`;
    });
});
