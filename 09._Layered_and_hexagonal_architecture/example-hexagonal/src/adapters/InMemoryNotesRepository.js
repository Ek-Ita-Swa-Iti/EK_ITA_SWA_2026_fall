// DRIVEN ADAPTER #1: keeps notes in memory. Implements the core's port.
// Note the direction of the import: adapter → core, never core → adapter.

const { NotesRepository } = require("../core/NotesRepository");

class InMemoryNotesRepository extends NotesRepository {
  notes = [{ id: 1, title: "Welcome", body: "Stored in memory by InMemoryNotesRepository." }];

  async findAll() {
    return this.notes;
  }

  async findById(id) {
    return this.notes.find((note) => note.id === id) ?? null;
  }

  async create(title, body) {
    const note = { id: this.notes.length + 1, title, body };
    this.notes.push(note);
    return note;
  }
}

module.exports = { InMemoryNotesRepository };
