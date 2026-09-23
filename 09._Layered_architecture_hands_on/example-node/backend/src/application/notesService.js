// Application layer: sits between presentation and persistence.
// Presentation calls this layer; this layer calls persistence. Nothing skips it.
//
// Only create() has behaviour of its own. findAll() and findById() just pass
// the call down and the data back up.

const notesRepository = require("../persistence/notesRepository");

async function findAll() {
  return notesRepository.findAll();
}

async function findById(id) {
  return notesRepository.findById(id);
}

async function create(title, body) {
  // The one rule this layer owns: notes are stored without leading or
  // trailing whitespace, whichever persistence layer is underneath.
  return notesRepository.create(title.trim(), body.trim());
}

module.exports = { findAll, findById, create };
