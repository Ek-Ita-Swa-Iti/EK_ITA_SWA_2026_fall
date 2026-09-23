// THE PORT. Owned by the core, written on the core's terms.
// It says *what* the core needs from storage — never *how* it's provided.
// Adapters implement this interface; the core never imports an adapter.

export interface Note {
  id: number;
  title: string;
  body: string;
}

export interface NotesRepository {
  findAll(): Promise<Note[]>;
  findById(id: number): Promise<Note | null>;
  create(title: string, body: string): Promise<Note>;
}
