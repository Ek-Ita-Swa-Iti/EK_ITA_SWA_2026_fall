// THE PORT. Owned by the core, written on the core's terms.
// It says *what* the core needs from storage — never *how* it's provided.
//
// JavaScript has no interfaces, so the port is a base class whose methods
// only throw. Adapters `extends NotesRepository` and override all three —
// which also makes their dependency on the port visible in their imports.
// The core never imports an adapter.
//
// A note looks like: { id: number, title: string, body: string }

class NotesRepository {
  async findAll() {
    throw new Error("findAll() not implemented");
  }

  async findById(id) {
    throw new Error("findById() not implemented");
  }

  async create(title, body) {
    throw new Error("create() not implemented");
  }
}

module.exports = { NotesRepository };
