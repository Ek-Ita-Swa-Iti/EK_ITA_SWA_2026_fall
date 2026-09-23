// COMPOSITION ROOT: the one file that knows both sides.
// It picks a driven adapter, hands it to the core, and plugs the core into
// a driving adapter. Swapping storage is a change here — and only here.

const { NotesService } = require("./core/NotesService");
const { InMemoryNotesRepository } = require("./adapters/InMemoryNotesRepository");
const { JsonFileNotesRepository } = require("./adapters/JsonFileNotesRepository");
const { startHttpServer } = require("./adapters/httpServer");

const repository =
  process.env.NOTES_STORE === "file"
    ? new JsonFileNotesRepository("/tmp/notes.json")
    : new InMemoryNotesRepository();

const service = new NotesService(repository);

startHttpServer(service, Number(process.env.PORT ?? 3000));
