// DRIVEN ADAPTER #2: keeps notes in a JSON file. Same port, different storage.

const { readFile, writeFile } = require("node:fs/promises");
const { NotesRepository } = require("../core/NotesRepository");

class JsonFileNotesRepository extends NotesRepository {
  constructor(path) {
    super();
    this.path = path;
  }

  async findAll() {
    try {
      return JSON.parse(await readFile(this.path, "utf8"));
    } catch {
      return []; // no file yet = no notes yet
    }
  }

  async findById(id) {
    return (await this.findAll()).find((note) => note.id === id) ?? null;
  }

  async create(title, body) {
    const notes = await this.findAll();
    const note = { id: notes.length + 1, title, body };
    await writeFile(this.path, JSON.stringify([...notes, note], null, 2));
    return note;
  }
}

module.exports = { JsonFileNotesRepository };
