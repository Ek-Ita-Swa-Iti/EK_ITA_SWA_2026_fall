// Development-only persistence layer: hardcoded data, no database.
//
// This is a swap point, not the final answer. A later persistence layer that
// reads from a real database will expose the same two functions
// (findAll, findById) with the same shapes — so presentation/server.js,
// which only calls this contract, won't need to change when that swap happens.

const notes = [
  { id: 1, title: "Welcome", body: "This note is hardcoded, not read from a database." },
  { id: 2, title: "Second note", body: "Still hardcoded. Swap this file for a real one later." },
];

function findAll() {
  return notes;
}

function findById(id) {
  return notes.find((note) => note.id === id) ?? null;
}

module.exports = { findAll, findById };
