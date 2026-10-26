// Persistence layer backed by MongoDB — the source of truth for notes.
//
// Contract: findAll, findById, create, update, remove, all async, same note
// shape ({ id, title, body }). server.js only needs its require(...) line
// changed to swap this file for another one — nothing else.
//
// Connects to docker-compose.yml's "mongo" service, container-to-container,
// by service name — not localhost. The official driver queues operations
// and retries server selection internally, so it rides out the race where
// the container is up before the database accepts connections.

const { MongoClient } = require("mongodb");

const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017";
const DB_NAME = process.env.DB_NAME || "notes_db";

const client = new MongoClient(MONGO_URL);
const notes = client.db(DB_NAME).collection("notes");

// MongoDB's own _id isn't a number, and server.js's routes only match
// numeric ids (/v1/notes/1). So documents carry their own numeric `id`
// field, and `_id` never leaves this file.
function toNote(doc) {
  return { id: doc.id, title: doc.title, body: doc.body };
}

// A fresh container starts empty, so the first call seeds it.
const ready = (async () => {
  const count = await notes.countDocuments();
  if (count === 0) {
    await notes.insertMany([
      { id: 1, title: "Indkøb", body: "Kaffebønner og mælk" },
      { id: 2, title: "Espresso", body: "Maskinen skal afkalkes" },
      { id: 3, title: "Møde", body: "Flyttet til torsdag" },
    ]);
  }
})();

async function nextId() {
  const [last] = await notes.find().sort({ id: -1 }).limit(1).toArray();
  return (last?.id ?? 0) + 1;
}

async function findAll() {
  await ready;
  const docs = await notes.find().sort({ id: 1 }).toArray();
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
  // insertOne stamps an _id onto its argument — insert a copy so the
  // object this function returns stays { id, title, body }.
  await notes.insertOne({ id, title, body });
  return { id, title, body };
}

async function update(id, title, body) {
  await ready;
  const doc = await notes.findOneAndUpdate(
    { id },
    { $set: { title, body } },
    { returnDocument: "after" },
  );
  return doc ? toNote(doc) : null;
}

async function remove(id) {
  await ready;
  const result = await notes.deleteOne({ id });
  return result.deletedCount === 1;
}

module.exports = { findAll, findById, create, update, remove };
