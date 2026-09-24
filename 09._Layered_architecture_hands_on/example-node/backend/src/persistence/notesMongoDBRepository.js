// Persistence layer backed by MongoDB — the Session 9, Part 2b swap.
//
// Same three-function contract as notesRepository.js: findAll, findById,
// create, all async, same note shape ({ id, title, body }). server.js only
// needs its require(...) line changed to point here — nothing else.
//
// Connects to docker-compose.yml's "mongo" service, container-to-container,
// by service name — not localhost. Compare with frontend/public/app.js,
// which runs in the browser and has to use localhost:3000 for the same
// reason in reverse.
//
// No retry logic here, unlike notesDBRepository.js: depends_on only waits
// for the mongo *container* to start, not for the database to accept
// connections, but the official MongoDB driver queues operations and
// retries server selection internally — so it rides out that race on its
// own instead of the app code having to handle it.

const { MongoClient } = require("mongodb");

const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017";
const DB_NAME = process.env.DB_NAME || "notes_db";

const client = new MongoClient(MONGO_URL);
const notes = client.db(DB_NAME).collection("notes");

// MongoDB gives every document an _id of its own, but it isn't a number —
// and server.js's routes only match numeric ids (/notes/1). So documents
// carry their own numeric `id` field, and `_id` never leaves this file.
function toNote(doc) {
  return { id: doc.id, title: doc.title, body: doc.body };
}

// The collection doesn't exist yet on a fresh container, so the first call
// seeds it — same "starts empty, works immediately" experience the
// in-memory version gives for free.
const ready = (async () => {
  const count = await notes.countDocuments();
  if (count === 0) {
    await notes.insertMany([
      { id: 1, title: "Welcome", body: "This note is read from MongoDB, not hardcoded." },
      { id: 2, title: "Second note", body: "Swapped in by changing one require(...) line." },
    ]);
  }
})();

async function nextId() {
  const [last] = await notes.find().sort({ id: -1 }).limit(1).toArray();
  return (last?.id ?? 0) + 1;
}

async function findAll() {
  await ready;
  const docs = await notes.find().toArray();
  return docs.map(toNote);
}

async function findById(id) {
  await ready;
  const doc = await notes.findOne({ id });
  return doc ? toNote(doc) : null;
}

async function create(title, body) {
  await ready;
  const id = await nextId();
  // insertOne mutates its argument, stamping an _id onto it — insert a copy
  // so the object this function returns stays { id, title, body }.
  await notes.insertOne({ id, title, body });
  return { id, title, body };
}

module.exports = { findAll, findById, create };
