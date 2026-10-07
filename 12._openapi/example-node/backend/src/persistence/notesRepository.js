// Development-only persistence layer: hardcoded data, no database.
//
// This is a swap point, not the final answer. A later persistence layer that
// reads from a real database will expose the same functions (findAll,
// findById, create, update, remove) with the same shapes — so
// presentation/server.js, which only calls this contract, won't need to
// change when that swap happens.
//
// The functions are async even though nothing here waits on anything: a real
// database or HTTP call returns a Promise, so the contract is async from day one.

const notes = [
  { id: 1, title: "Welcome", body: "This note is hardcoded, not read from a database." },
  { id: 2, title: "Second note", body: "Still hardcoded. Swap this file for a real one later." },
];

let nextId = notes.length + 1;

async function findAll() {
  return notes;
}

async function findById(id) {
  return notes.find((note) => note.id === id) ?? null;
}

async function create(title, body) {
  const note = { id: nextId++, title, body };
  notes.push(note);
  return note;
}

// update and remove return null/false when the id doesn't exist, so the
// presentation layer can answer 404 without knowing how notes are stored.
async function update(id, title, body) {
  const note = notes.find((n) => n.id === id);
  if (!note) return null;
  note.title = title;
  note.body = body;
  return note;
}

async function remove(id) {
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
