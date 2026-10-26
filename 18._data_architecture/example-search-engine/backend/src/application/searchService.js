// Application layer: the search engine's rules. It decides *what* happens —
// which database is asked, in which order — but not *how* each one is
// talked to. That's persistence.
//
// Every search runs twice, side by side:
//   1. text search in MySQL   — do the letters match?
//   2. vector search in Qdrant — does the meaning match?
// and returns what each one did, so the frontend can show it. The two don't
// talk to each other: Qdrant answers with whole pages on its own.

const pagesRepository = require("../persistence/pagesMySQLRepository");
const vectorRepository = require("../persistence/pagesVectorRepository");
const embeddingModel = require("../persistence/embeddingModel");

const VECTOR_RESULTS = 5;

// What gets turned into numbers for a page: its title and its text.
function passageOf(page) {
  return `passage: ${page.title}. ${page.body}`;
}

async function index(pages) {
  const vectors = await embeddingModel.embedMany(pages.map(passageOf));
  await vectorRepository.upsert(pages.map((page, i) => ({ page, vector: vectors[i] })));
}

// Make sure Qdrant has every page from MySQL. If the counts differ, rebuild
// the whole index from MySQL — the source of truth. If Qdrant is down, try
// again on the next search instead of giving up for good.
let indexReady;

function ready() {
  if (!indexReady) {
    indexReady = (async () => {
      await vectorRepository.ensureCollection(embeddingModel.DIMENSIONS);
      const pages = await pagesRepository.findAll();
      if ((await vectorRepository.count()) !== pages.length) {
        await index(pages);
        console.log(`Vector index rebuilt from MySQL: ${pages.length} pages`);
      }
    })().catch((err) => {
      indexReady = null;
      throw err;
    });
  }
  return indexReady;
}

ready().catch((err) => console.error(`Vector index not ready: ${err.message}`));

async function textSearch(q) {
  const { statement, rows, ms } = await pagesRepository.search(q);
  return { statement, ms, results: rows };
}

async function vectorSearch(q) {
  await ready();

  // Step 1 + 2: the search text becomes 384 numbers.
  const text = `query: ${q}`;
  const started = Date.now();
  const vector = await embeddingModel.embed(text);
  const embedMs = Date.now() - started;

  // Step 3: Qdrant finds the points closest to those numbers, and answers
  // with each point's score and the page stored next to it (its payload).
  const qdrant = await vectorRepository.query(vector, VECTOR_RESULTS);
  const results = qdrant.points.map((point) => ({
    id: point.id,
    ...point.payload,
    score: point.score,
    vector: point.vector,
  }));

  return {
    embedding: { text, model: embeddingModel.MODEL, dimensions: vector.length, vector, ms: embedMs },
    qdrant: { request: qdrant.request, ms: qdrant.ms },
    results,
  };
}

// The two searches don't depend on each other: if one database is down, the
// other one still answers.
async function search(q) {
  const [text, vector] = await Promise.allSettled([textSearch(q), vectorSearch(q)]);
  const outcome = (result) =>
    result.status === "fulfilled" ? result.value : { error: result.reason.message };
  return { query: q, text: outcome(text), vector: outcome(vector) };
}

// A new page is saved in MySQL first, then turned into numbers and saved in
// Qdrant — automatically, on every insert. If Qdrant is down, the page is
// still safe in MySQL, and the next rebuild puts it into Qdrant.
async function addPage(title, url, body) {
  const page = await pagesRepository.create(title, url, body);
  try {
    await ready();
    await index([page]);
    return { page, indexed: true, dimensions: embeddingModel.DIMENSIONS };
  } catch (err) {
    console.error(`Vector index: ${err.message}`);
    return { page, indexed: false, error: err.message };
  }
}

async function listPages() {
  return pagesRepository.findAll();
}

module.exports = { search, addPage, listPages };
