# Session 9: Layered Architecture (Hands-on)

**ITA Software Architecture 2026 Fall | 3 hours**

> Last week we found the layers and the rule that holds them together. Today we make it concrete: one tiny layered service, and then you swap its persistence layer — twice — and see what the dependency rule buys you.

---

## Learning Goals

- Restate the principles of **layered architecture** — layers, the downward dependency rule, and how to verify it from the imports — on the smallest possible working example.
- Swap a persistence layer — to a JSON API and to MongoDB in Docker — by writing a new file and changing a single line in the layer above.

---

## Before Class

- Pull the latest course repo and have Docker running — we open with a live demo of `example-node/` in this folder.

---

## Today's Teachings

### Part 1 — Layered architecture, live: the Node.js example (20 min)

We start by looking at code together. The instructor demos a tiny notes service and uses it to walk through the principles of layered architecture from S8 — this time on an example small enough to hold in your head at once.

The example lives right here in this session's folder:

```bash
cd 09._Layered_architecture_hands_on/example-node
docker compose up --build
```

Then open `http://localhost:8080`, or talk to the backend directly with `curl localhost:3000/notes`.

What it is, in one breath: **two layers only** (`presentation/` and `persistence/`), **zero npm dependencies** (Node's built-in `http` module), and a separate backend and frontend Docker image. The folder's own [`README.md`](example-node/README.md) has the run instructions and the details.

Follow along during the demo and keep these questions in mind:

- Where are the layers, and what is each one responsible for?
- Which way do the dependencies point? How would you *prove* it without trusting anyone's diagram?
- What would it take to swap the hardcoded persistence for a real database — and which files should *not* have to change?

The demo ends by answering the last question live: the instructor swaps the hardcoded persistence layer for a new one that reads from a **MySQL** database running in a Docker container. Watch what changes — a new file in `persistence/`, a database service in `docker-compose.yml`, and the one `require(...)` line in `server.js`. Watch what *doesn't* change: the rest of `server.js`, the frontend, and the `curl` commands.

### Part 2 — Exercise: swap the persistence layer yourself (45 min)

Now you do the same swap, twice. Work in pairs, in your own copy of `example-node/`.

**The rules for both parts:**

- Write a **new file** in `backend/src/persistence/`. Don't edit `notesRepository.js` — the hardcoded version stays as it is.
- The new file must export the same three **async** functions with the same shapes: `findAll()` → array of notes, `findById(id)` → one note or `null`, `create(title, body)` → the created note. Each note looks like `{ id, title, body }`, with a **numeric** `id`.
- In `presentation/server.js` you may change **exactly one line**: the `require(...)` at the top. Nothing else.
- Done means: the three `curl` commands from the example's README work **unchanged**, and the frontend on `http://localhost:8080` still lists notes.

#### Part 2a — Persistence that reads from a JSON API

Create `persistence/notesRepository.api.js` that stores notes in a remote JSON API instead of in memory: **[JSONPlaceholder](https://jsonplaceholder.typicode.com)**, a free fake REST API.

Its `/posts` resource already has the shape we need — every post has `id`, `title` and `body`:

| Our contract          | JSONPlaceholder call                                    |
|-----------------------|---------------------------------------------------------|
| `findAll()`           | `GET https://jsonplaceholder.typicode.com/posts`       |
| `findById(id)`        | `GET https://jsonplaceholder.typicode.com/posts/{id}` — a `404` means `null` |
| `create(title, body)` | `POST https://jsonplaceholder.typicode.com/posts` with `{ "title": ..., "body": ... }` |

Hints:

- Node 20 has `fetch` built in — you still need **zero** npm dependencies.
- Try the API with `curl` first, before you write any code.
- The API only *pretends* to save: a `POST` returns `201` with `id: 101`, but the post is not really stored, so `GET /posts/101` afterwards gives `404`. That's the API's limitation, not a bug in your code.
- The API returns an extra `userId` field. Should your persistence layer pass it on, or strip it? Decide, and be ready to explain why.

#### Part 2b — Persistence that reads from MongoDB in Docker

Create `persistence/notesRepository.mongo.js` that stores notes in a **MongoDB** database running in its own container.

1. Add a `mongo` service to `docker-compose.yml` (the official `mongo` image).
2. Add the official driver to the backend: `npm install mongodb` inside `backend/`. Your backend now has a dependency — so its `Dockerfile` has to copy `package-lock.json` and run `npm install` before copying `src/`.
3. Connect from the backend with the connection string `mongodb://mongo:27017`.

Hints:

- Why `mongo` and not `localhost`? This time the call goes **container to container**, inside the Docker network — so the service name works. Compare with the frontend's `app.js`, which has to use `localhost:3000` because it runs in the browser.
- MongoDB gives every document an `_id` of its own, which isn't a number. The routes in `server.js` only match numeric ids (`/notes/1`), so you have to keep a numeric `id` field yourself — and decide whether `_id` leaks out through your contract.
- `depends_on` only waits for the MongoDB *container* to start, not for the database to accept connections. Does your first request still work? Find out why — the answer is in the driver, not in your code.

**When you're done with both, answer in your pair:** how many lines of `server.js` did you change in total? Which *single* line knows which persistence layer is in use — and which layer does that line live in? Hold on to that answer: it's where the next session (hexagonal architecture) starts.

---

## After Class

- If you didn't finish both halves of Part 2, finish them now — the next session starts from your Part 2 code.
- Skim ahead: next session covers **hexagonal architecture** (ports & adapters) — the answer to the question Part 2 ends with.
