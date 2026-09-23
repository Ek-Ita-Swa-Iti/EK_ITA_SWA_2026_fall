// DRIVEN ADAPTER #2: keeps notes in a JSON file. Same port, different storage.

import { readFile, writeFile } from "node:fs/promises";
import type { Note, NotesRepository } from "../core/NotesRepository.ts";

export class JsonFileNotesRepository implements NotesRepository {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  async findAll(): Promise<Note[]> {
    try {
      return JSON.parse(await readFile(this.path, "utf8"));
    } catch {
      return []; // no file yet = no notes yet
    }
  }

  async findById(id: number): Promise<Note | null> {
    return (await this.findAll()).find((note) => note.id === id) ?? null;
  }

  async create(title: string, body: string): Promise<Note> {
    const notes = await this.findAll();
    const note = { id: notes.length + 1, title, body };
    await writeFile(this.path, JSON.stringify([...notes, note], null, 2));
    return note;
  }
}
