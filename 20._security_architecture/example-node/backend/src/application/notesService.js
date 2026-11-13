// Application layer: reglerne for noter. Her bestemmes, hvilken database
// der skrives til, og i hvilken rækkefølge. server.js kender kun denne fil.

const notesRepository = require("../persistence/notesMongoDBRepository");
const notesVectorRepository = require("../persistence/notesVectorRepository");
const embeddingModel = require("../persistence/embeddingModel");

// Lav en note om til tal, og gem tallene i Qdrant.
// Fejler det, er noten stadig gemt i MongoDB. Den kan bare ikke findes
// på betydning, før indekset bygges op igen.
async function index(note) {
  try {
    await notesVectorRepository.ensureCollection(embeddingModel.DIMENSIONS);
    const vector = await embeddingModel.embed(`${note.title}. ${note.body}`);
    await notesVectorRepository.upsert(note, vector);
  } catch (err) {
    console.error(`Kunne ikke indeksere note ${note.id}: ${err.message}`);
  }
}

async function rebuildIndex() {
  await notesVectorRepository.ensureCollection(embeddingModel.DIMENSIONS);
  const notes = await notesRepository.findAll();
  if ((await notesVectorRepository.count()) === notes.length) return;
  for (const note of notes) await index(note);
  console.log(`Qdrant bygget op igen: ${notes.length} noter`);
}

async function findAll() {
  return notesRepository.findAll();
}

async function findById(id) {
  return notesRepository.findById(id);
}

async function create(title, body) {
  const note = await notesRepository.create(title, body); // MongoDB først
  await index(note);
  return note;
}

async function update(id, title, body) {
  const note = await notesRepository.update(id, title, body);
  if (note) await index(note);
  return note;
}

async function remove(id) {
  const removed = await notesRepository.remove(id);
  if (removed) {
    await notesVectorRepository.remove(id).catch((err) => console.error(err.message));
  }
  return removed;
}

async function search(q) {
  await notesVectorRepository.ensureCollection(embeddingModel.DIMENSIONS);
  const vector = await embeddingModel.embed(q);
  return notesVectorRepository.query(vector);
}

module.exports = { rebuildIndex, findAll, findById, create, update, remove, search };
