// COMPOSITION ROOT: the one file that knows both sides.
// It picks a driven adapter, hands it to the core, and plugs the core into
// a driving adapter. Swapping storage is a change here — and only here.

import { NotesService } from "./core/NotesService.ts";
import { InMemoryNotesRepository } from "./adapters/InMemoryNotesRepository.ts";
import { JsonFileNotesRepository } from "./adapters/JsonFileNotesRepository.ts";
import { startHttpServer } from "./adapters/httpServer.ts";

const repository =
  process.env.NOTES_STORE === "file"
    ? new JsonFileNotesRepository("/tmp/notes.json")
    : new InMemoryNotesRepository();

const service = new NotesService(repository);

startHttpServer(service, Number(process.env.PORT ?? 3000));
