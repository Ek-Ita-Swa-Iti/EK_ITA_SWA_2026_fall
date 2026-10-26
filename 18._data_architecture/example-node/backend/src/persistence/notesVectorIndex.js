// Persistence layer for the vector database (Qdrant Cloud).
//
// We never send numbers. We send *text* and the name of an embedding model,
// and Qdrant turns the text into a vector itself — both when a note is saved
// and when we search. That's Qdrant Cloud Inference.
//
// MySQL is the source of truth. This index only holds each note's id and its
// vector, so it can always be rebuilt from MySQL (see indexAll).

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION = process.env.QDRANT_COLLECTION || "notes";

// A free, multilingual model in Qdrant Cloud. It turns any text into 384
// numbers, so the collection must be created with size 384.
const MODEL = "intfloat/multilingual-e5-small";
const VECTOR_SIZE = 384;

function isConfigured() {
  return Boolean(QDRANT_URL && QDRANT_API_KEY);
}

async function qdrant(method, path, body) {
  const res = await fetch(`${QDRANT_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "api-key": QDRANT_API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Qdrant ${method} ${path} → ${res.status}: ${JSON.stringify(json.status)}`);
  }
  return json.result;
}

// The text that gets embedded: title and body together.
function textOf(note) {
  return `${note.title}. ${note.body}`;
}

async function ensureCollection() {
  const { exists } = await qdrant("GET", `/collections/${COLLECTION}/exists`);
  if (!exists) {
    await qdrant("PUT", `/collections/${COLLECTION}`, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });
  }
}

// Save one or more notes. Same id as in MySQL, so saving again overwrites.
async function indexAll(notes) {
  if (notes.length === 0) return;
  await qdrant("PUT", `/collections/${COLLECTION}/points?wait=true`, {
    points: notes.map((note) => ({
      id: note.id,
      vector: { text: textOf(note), model: MODEL },
      payload: { title: note.title },
    })),
  });
}

async function index(note) {
  await indexAll([note]);
}

async function remove(id) {
  await qdrant("POST", `/collections/${COLLECTION}/points/delete?wait=true`, { points: [id] });
}

// Returns [{ id, score }], closest first. Score is cosine similarity:
// close to 1 means "means almost the same", lower means "further away".
async function search(query, limit = 3) {
  const result = await qdrant("POST", `/collections/${COLLECTION}/points/query`, {
    query: { text: query, model: MODEL },
    limit,
  });
  return result.points.map((point) => ({ id: point.id, score: point.score }));
}

module.exports = { isConfigured, ensureCollection, indexAll, index, remove, search };
