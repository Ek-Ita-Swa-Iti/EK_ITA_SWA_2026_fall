// THE CORE. The application's rules live here — and nothing else.
// Its only import is the port. No HTTP, no files, no database.

import type { Note, NotesRepository } from "./NotesRepository.ts";

export class ValidationError extends Error {}

export class NotesService {
  private repository: NotesRepository;

  constructor(repository: NotesRepository) {
    this.repository = repository;
  }

  list(): Promise<Note[]> {
    return this.repository.findAll();
  }

  get(id: number): Promise<Note | null> {
    return this.repository.findById(id);
  }

  async create(title: string, body: string): Promise<Note> {
    // A business rule: it belongs to the core, not to HTTP or to storage.
    if (!title?.trim() || !body?.trim()) {
      throw new ValidationError("title and body are required");
    }
    return this.repository.create(title.trim(), body.trim());
  }
}
