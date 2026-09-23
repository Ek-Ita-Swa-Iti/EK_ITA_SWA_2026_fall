// THE CORE. The application's rules live here — and nothing else.
// Its only import is the port. No HTTP, no files, no database.

const { NotesRepository } = require("./NotesRepository");

class ValidationError extends Error {}

class NotesService {
  constructor(repository) {
    if (!(repository instanceof NotesRepository)) {
      throw new TypeError("NotesService needs a NotesRepository");
    }
    this.repository = repository;
  }

  list() {
    return this.repository.findAll();
  }

  get(id) {
    return this.repository.findById(id);
  }

  async create(title, body) {
    // A business rule: it belongs to the core, not to HTTP or to storage.
    if (!title?.trim() || !body?.trim()) {
      throw new ValidationError("title and body are required");
    }
    return this.repository.create(title.trim(), body.trim());
  }
}

module.exports = { NotesService, ValidationError };
