// This is the browser calling the backend directly — not the frontend
// container calling it. That's why this is the published host port
// (localhost:3000), not the docker-compose service name (backend:3000).
const BACKEND_URL = "http://localhost:3000";

function show(listId, items, format) {
  const list = document.getElementById(listId);
  list.textContent = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = format(item);
    list.appendChild(li);
  });
}

fetch(`${BACKEND_URL}/v1/notes`)
  .then((res) => res.json())
  .then((notes) => show("notes", notes, (note) => `${note.title}: ${note.body}`))
  .catch((err) => {
    document.getElementById("notes").textContent = `Failed to reach backend: ${err}`;
  });

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const q = document.getElementById("search").value;
  fetch(`${BACKEND_URL}/v1/notes/search?q=${encodeURIComponent(q)}`)
    .then((res) => res.json())
    .then((results) => {
      if (results.error) throw new Error(results.error);
      show("results", results, (r) => `${r.score.toFixed(3)}  ${r.title}: ${r.body}`);
    })
    .catch((err) => {
      document.getElementById("results").textContent = `Search failed: ${err.message}`;
    });
});
