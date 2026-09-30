# Session 11a: Hexagonal Architecture (Ports & Adapters)

**ITA Software Architecture 2026 Fall | 3 hours**

> Last session ended with a question: which single line knows which persistence layer is in use? Today we build an architecture around that line. The core sits in the middle, everything else plugs into it, and every dependency points inward.

---

## Learning Goals

- Name the parts of a hexagonal architecture (**core**, **port**, **driving adapter**, **driven adapter** and **composition root**) and point at each one in a small working example.
- Explain the rule that holds it together: **every dependency points into the core**. Check that rule from the imports.
- Add new adapters to an application without changing its core, and test the core without any infrastructure at all.

---

## Before Class

- Pull the latest course repo and have Docker running. We open with a live demo of `example-python/` in this folder.
- The example is written in **Python**, which is new to most of you. You don't need to install it, because everything runs in Docker. We'll read the code together in class.

---

## Today's Teachings

### Part 1 — Ports & adapters, live: the Python example (25 min)

We start by looking at code together. I'll demo the same tiny notes service you know from Session 9, rebuilt as ports & adapters.

We warm up on an even smaller one first: [`example-simple/`](example-simple/README.md), a welcome message with one port and two adapters you swap by changing one line.

```bash
cd x11._hexagonal_architecture/example-python
docker compose up --build
```

Then talk to it with `curl localhost:3000/notes`. It's the same endpoints and the same `curl`s as `example-node/`.

What it is, in one breath: **five small files**: a core, one port, two adapters and a `main.py` that plugs them together. The folder's own [`README.md`](example-python/README.md) has the run instructions, a diagram and a table of the five words we use today.

Follow along during the demo and keep these questions in mind:

- Which files make up the **core**? What does the core know about HTTP, or about where notes are stored?
- Which way do the imports point? Prove it without trusting the diagram.
- Where is the line that decides that notes are kept in memory? Compare it with the line you changed in Session 9, Part 2: which file is it in, and which layer was that?

### Part 2 — Exercise: new adapters, same core (60 min)

Work in pairs, in your own copy of `example-python/`.

**One rule for everything below: nothing in `core/` may change.** You add new files and you plug them in, in `main.py` or in a new composition root of your own. If you feel you need to change the core, stop and discuss it in your pair. That's a sign the port is wrong, or that your code belongs somewhere else.

#### Part 2a — A new driven adapter: notes in a JSON file

Create `adapters/json_file_notes_repository.py` with a class `JsonFileNotesRepository` that extends `NotesRepository` and keeps the notes in a file called `notes.json`.

- It must have the same three methods as the port: `find_all()`, `find_by_id(note_id)` and `create(title, body)`. Notes have the same shape, `{"id": ..., "title": ..., "body": ...}`, with a **numeric** `id`.
- Plug it in by changing `main.py`, and only `main.py`.
- Done means: the three `curl`s from the example's README work unchanged. After `docker compose restart` your new notes are still there, which the in-memory version can't do.

Hints:

- Python's built-in `json` module reads and writes the file: `json.load(file)` and `json.dump(notes, file)`.
- The file doesn't exist the first time the app starts. What should `find_all()` return then?

#### Part 2b — A new driving adapter: a command-line interface

Not every user of the core speaks HTTP. Create `cli.py` next to `main.py`: a second composition root that plugs a **command line** into the same core.

```bash
docker compose up --build -d
docker compose exec app python cli.py list
docker compose exec app python cli.py add "From the CLI" "No HTTP involved"
docker compose exec app python cli.py show 1
```

Hints:

- `sys.argv` (from the built-in `sys` module) is the list of words on the command line: `sys.argv[1]` is `list`, `add` or `show`.
- Use your JSON file adapter from 2a. Add a note with the CLI, then `curl localhost:3000/notes`. Two driving adapters and one driven adapter, all plugged into the same core.

#### Part 2c — Test the core without any infrastructure

Create `test_notes_service.py` next to `main.py`. In it, write a `FakeNotesRepository` that extends `NotesRepository` and just keeps what it's given in a list. Then test `NotesService` with it, using Python's built-in `unittest`:

- `create_note("  My note ", "Hello")` stores the title as `"My note"`.
- `create_note("   ", "Hello")` raises a `ValueError` and stores nothing.

```bash
docker compose build
docker compose run --rm app python -m unittest
```

No HTTP, no files and no database. Which part of the architecture made that possible?

#### Part 2d — Stretch: MySQL as a driven adapter

Do the Session 9 demo swap again, this time as an adapter: `adapters/mysql_notes_repository.py`, backed by MySQL in its own container.

1. Add a `db` service to `docker-compose.yml` (`mysql:8.0`, with `MYSQL_ROOT_PASSWORD` set).
2. The app now needs a package that isn't in the standard library, the `PyMySQL` driver. Add a `requirements.txt` containing `PyMySQL`. The `Dockerfile` has to copy it and run `pip install -r requirements.txt` before copying the rest of the code.
3. Connect with host `db`, the compose service name, just as in Session 9.

Hints:

- `pymysql.cursors.DictCursor` makes rows come back as `{"id": ..., "title": ..., "body": ...}`, which is already the shape the port promises.
- MySQL takes a while to start, and `depends_on` doesn't wait for it. Retry the connection a few times before giving up.

### Part 3 — Wrap-up: layered vs hexagonal (10 min)

Put `example-node/` from Session 9 (the `s9-application-layer` version) next to `example-python/` and answer together:

- In the layered version, the application layer imports persistence. In the hexagonal version, who imports whom? What changed direction?
- In Session 9 each swap changed one line in `server.js`, which is part of your presentation layer. Today each new adapter changed zero lines in `core/` and one in `main.py`. Why does it matter which file that one line lives in?
- `example-python/` has more files than it strictly needs. What did we pay for the extra files, and what did we get for them?

---

## After Class

- Finish Part 2a to 2c if you didn't get there. Try 2d if you want to see the same core work against a real database.
