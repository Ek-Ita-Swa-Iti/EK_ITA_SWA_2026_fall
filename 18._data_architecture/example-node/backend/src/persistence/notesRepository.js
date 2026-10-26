// Development-only persistence layer: hardcoded data, no database.
//
// Same contract as notesMongoDBRepository.js (findAll, findById, create,
// update, remove — all async), so server.js can switch between the two by
// changing its one require(...) line.

const notes = [
  { id: 1, title: "Indkøb", body: "Kaffebønner og mælk" },
  { id: 2, title: "Espresso", body: "Maskinen skal afkalkes" },
  { id: 3, title: "Møde", body: "Flyttet til torsdag" },
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

async function update(id, title, body) {
  const note = notes.find((n) => n.id === id);
  if (!note) return null;
  Object.assign(note, { title, body });
  return note;
}

async function remove(id) {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
