// This is the browser calling the backend directly — not the frontend
// container calling it. That's why this is the published host port
// (localhost:3000), not the docker-compose service name (backend:3000).
const BACKEND_URL = "http://localhost:3000";

const $ = (id) => document.getElementById(id);

function round(n) {
  return Number(n.toFixed(4));
}

// The vector is 384 numbers. Show the first few, and say how many there are.
function shortVector(vector, count = 6) {
  return `[${vector.slice(0, count).map(round).join(", ")}, … i alt ${vector.length} tal]`;
}

// Draw a vector as a strip: one thin column per number, orange for positive,
// blue for negative, stronger colour for bigger numbers.
function drawStrip(canvas, vector) {
  const ctx = canvas.getContext("2d");
  canvas.width = vector.length;
  const max = Math.max(...vector.map(Math.abs));
  vector.forEach((value, i) => {
    const strength = Math.abs(value) / max;
    ctx.fillStyle = value >= 0 ? `rgba(176, 81, 47, ${strength})` : `rgba(47, 111, 176, ${strength})`;
    ctx.fillRect(i, 0, 1, canvas.height);
  });
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// Highlight the exact letters MySQL matched on.
function highlight(text, q) {
  const safe = escapeHtml(text);
  const pattern = new RegExp(escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return safe.replace(pattern, (match) => `<mark>${match}</mark>`);
}

function pageHtml(page, q) {
  return `
    <div class="title">${q ? highlight(page.title, q) : escapeHtml(page.title)}</div>
    <div class="url">${escapeHtml(page.url)}</div>
    <div class="body">${q ? highlight(page.body, q) : escapeHtml(page.body)}</div>`;
}

function showText(text, q) {
  const list = $("sql-results");
  list.innerHTML = "";
  if (text.error) {
    $("sql-statement").textContent = "";
    $("sql-meta").innerHTML = `<span class="error">MySQL svarer ikke: ${escapeHtml(text.error)}</span>`;
    return;
  }
  $("sql-statement").textContent = text.statement;
  $("sql-meta").textContent = `${text.results.length} rækker · ${text.ms} ms`;
  if (text.results.length === 0) {
    list.innerHTML = `<li class="empty">Ingen sider indeholder bogstaverne "${escapeHtml(q)}".</li>`;
  }
  text.results.forEach((page) => {
    const li = document.createElement("li");
    li.innerHTML = pageHtml(page, q);
    list.appendChild(li);
  });
}

function showVector(vector) {
  const list = $("vec-results");
  list.innerHTML = "";
  if (vector.error) {
    ["vec-text", "vec-numbers", "vec-request", "vec-response"].forEach((id) => ($(id).textContent = ""));
    $("vec-embed-meta").textContent = "";
    $("vec-qdrant-meta").innerHTML = `<span class="error">Qdrant svarer ikke: ${escapeHtml(vector.error)}</span>`;
    return;
  }

  const { embedding, qdrant, results } = vector;

  $("vec-text").textContent = embedding.text;

  drawStrip($("vec-strip"), embedding.vector);
  $("vec-numbers").textContent = shortVector(embedding.vector);
  $("vec-embed-meta").textContent = `${embedding.model} · ${embedding.dimensions} tal · ${embedding.ms} ms`;

  // Show the request as it was sent, but with the vector shortened.
  const body = { ...qdrant.request.body, query: "VEKTOR" };
  const json = JSON.stringify(body, null, 2).replace('"VEKTOR"', shortVector(qdrant.request.body.query, 3));
  $("vec-request").textContent = `${qdrant.request.method} ${qdrant.request.path}\n${json}`;

  // And Qdrant's answer, one line per point: id, score, payload (shortened).
  const points = results.map(
    (page) => `  { "id": ${page.id}, "score": ${page.score.toFixed(3)}, "payload": { "title": ${JSON.stringify(page.title)}, … } }`,
  );
  $("vec-response").textContent = `{ "points": [\n${points.join(",\n")}\n] }`;
  $("vec-qdrant-meta").textContent = `${results.length} nærmeste punkter · ${qdrant.ms} ms`;

  results.forEach((page) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="score"><span class="bar"><i style="width:${Math.max(0, page.score) * 100}%"></i></span>score ${page.score.toFixed(3)}</div>
      ${pageHtml(page)}
      <canvas class="strip" height="24"></canvas>`;
    list.appendChild(li);
    drawStrip(li.querySelector("canvas"), page.vector);
  });
}

async function search(q) {
  $("q").value = q;
  const res = await fetch(`${BACKEND_URL}/v1/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  $("message").textContent = "";
  $("columns").hidden = false;
  showText(data.text, q);
  showVector(data.vector);
}

function run(q) {
  search(q).catch((err) => {
    $("columns").hidden = true;
    $("message").textContent = `Kunne ikke søge: ${err.message}`;
  });
}

$("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const q = $("q").value.trim();
  if (q) run(q);
});

document.querySelectorAll(".examples a").forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    run(link.textContent);
  }),
);

$("add-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const page = { title: $("add-title").value, url: $("add-url").value, body: $("add-body").value };
  try {
    const res = await fetch(`${BACKEND_URL}/v1/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(page),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    $("add-result").textContent = data.indexed
      ? `Gemt i MySQL med id ${data.page.id}, og gemt i Qdrant som ${data.dimensions} tal. Søg efter den nu.`
      : `Gemt i MySQL med id ${data.page.id}, men IKKE i Qdrant (${data.error}). Den kan ikke findes på betydning, før indekset bygges op igen.`;
    event.target.reset();
  } catch (err) {
    $("add-result").textContent = `Kunne ikke gemme: ${err.message}`;
  }
});
