// Persistence layer: noterne som tal i Qdrant. Det er et søgeindeks,
// ikke sandhedskilden. Det kan altid bygges op igen ud fra MongoDB.

const QDRANT_URL = process.env.QDRANT_URL || "http://qdrant:6333";
const COLLECTION = "notes";

async function qdrant(method, path, body) {
  const res = await fetch(`${QDRANT_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Qdrant svarede ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
}

let collectionReady = false;

async function ensureCollection(dimensions) {
  if (collectionReady) return;
  const { exists } = await qdrant("GET", `/collections/${COLLECTION}/exists`);
  if (!exists) {
    await qdrant("PUT", `/collections/${COLLECTION}`, {
      vectors: { size: dimensions, distance: "Cosine" },
    });
  }
  collectionReady = true;
}

async function upsert(note, vector) {
  await qdrant("PUT", `/collections/${COLLECTION}/points?wait=true`, {
    points: [{ id: note.id, vector, payload: { title: note.title, body: note.body } }],
  });
}

async function remove(id) {
  await qdrant("POST", `/collections/${COLLECTION}/points/delete?wait=true`, { points: [id] });
}

async function count() {
  const result = await qdrant("POST", `/collections/${COLLECTION}/points/count`, { exact: true });
  return result.count;
}

async function query(vector, limit = 3) {
  const result = await qdrant("POST", `/collections/${COLLECTION}/points/query`, {
    query: vector,
    limit,
    with_payload: true,
  });
  return result.points.map((point) => ({
    id: point.id,
    score: point.score,
    title: point.payload.title,
    body: point.payload.body,
  }));
}

module.exports = { ensureCollection, upsert, remove, count, query };
