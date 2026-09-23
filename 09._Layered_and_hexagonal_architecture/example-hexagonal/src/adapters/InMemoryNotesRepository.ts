// DRIVEN ADAPTER #1: keeps notes in memory. Implements the core's port.
// Note the direction of the import: adapter → core, never core → adapter.

import type { Note, NotesRepository } from "../core/NotesRepository.ts";

export class InMemoryNotesRepository implements NotesRepository {
  private notes: Note[] = [
    { id: 1, title: "Welcome", body: "Stored in memory by InMemoryNotesRepository." },
  ];

  async findAll(): Promise<Note[]> {
    return this.notes;
  }

  async findById(id: number): Promise<Note | null> {
    return this.notes.find((note) => note.id === id) ?? null;
  }

  async create(title: string, body: string): Promise<Note> {
    const note = { id: this.notes.length + 1, title, body };
    this.notes.push(note);
    return note;
  }
}
