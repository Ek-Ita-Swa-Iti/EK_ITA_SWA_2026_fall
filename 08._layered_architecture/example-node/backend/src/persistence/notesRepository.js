// Development-only persistence layer: hardcoded data, no database.
//
// This is a swap point, not the final answer. A later persistence layer that
// reads from a real database will expose the same three functions
// (findAll, findById, create) with the same shapes — so presentation/server.js,
// which only calls this contract, won't need to change when that swap happens.

const notes = [
  { id: 1, title: "Welcome", body: "This note is hardcoded, not read from a database." },
  { id: 2, title: "Second note", body: "Still hardcoded. Swap this file for a real one later." },
];

let nextId = notes.length + 1;

function findAll() {
  return notes;
}

function findById(id) {
  return notes.find((note) => note.id === id) ?? null;
}

function create(title, body) {
  const note = { id: nextId++, title, body };
  notes.push(note);
  return note;
}

module.exports = { findAll, findById, create };
