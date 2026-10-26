// Persistence: Qdrant — the vector database. Every page lives here too: its
// id, its 384 numbers (its embedding), and the page itself as "payload", so a
// search can answer with whole pages. It can always be rebuilt from MySQL.
//
// Qdrant has a plain HTTP API, so we call it with fetch — no client library.

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION = "pages";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function qdrant(method, path, body) {
  const res = await fetch(`${QDRANT_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Qdrant ${method} ${path} → ${res.status}: ${JSON.stringify(json.status)}`);
  }
  return json.result;
}

// A collection is Qdrant's "table". It has to know how many numbers each
// vector has, and how to measure the distance between two of them.
async function ensureCollection(dimensions, attempts = 30) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { exists } = await qdrant("GET", `/collections/${COLLECTION}/exists`);
      if (!exists) {
        await qdrant("PUT", `/collections/${COLLECTION}`, {
          vectors: { size: dimensions, distance: "Cosine" },
        });
      }
      return;
    } catch (err) {
      if (attempt === attempts) throw err;
      await delay(1000);
    }
  }
}

async function count() {
  const result = await qdrant("POST", `/collections/${COLLECTION}/points/count`, { exact: true });
  return result.count;
}

// points: [{ page, vector }]. Same id as in MySQL, so saving again overwrites.
async function upsert(points) {
  await qdrant("PUT", `/collections/${COLLECTION}/points?wait=true`, {
    points: points.map(({ page, vector }) => ({
      id: page.id,
      vector,
      payload: { title: page.title, url: page.url, body: page.body },
    })),
  });
}

// "Which points lie closest to this one?" Returns the request and the
// answer as they were, so the frontend can show exactly what happened.
async function query(vector, limit) {
  const path = `/collections/${COLLECTION}/points/query`;
  const body = { query: vector, limit, with_payload: true, with_vector: true };
  const started = Date.now();
  const result = await qdrant("POST", path, body);
  return {
    request: { method: "POST", path, body },
    points: result.points,
    ms: Date.now() - started,
  };
}

module.exports = { ensureCollection, count, upsert, query };
