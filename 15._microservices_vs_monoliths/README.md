# Session 15: Microservices vs. Monoliths

**ITA Software Architecture 2026 Fall | 3 hours**

> Few topics in software architecture generate more heat and less light. Today we look honestly — and in *running code*: we read a real **modular monolith** (Gitea's ~40 `services/` packages), then run the **same product two ways** — as a monolith and as polyglot microservices — to feel exactly what splitting buys and what it costs. Most teams that "needed" microservices probably didn't; by the end you'll be able to say why with specifics.

---

## Learning Goals

- Define **monolith, modular monolith, microservices** precisely — not as vibes.
- Read a real modular monolith and reason about *where you'd cut a service, and what it would lose*.
- Run one product as a monolith and as microservices; see independent deployment, failure isolation, and polyglot in code.
- Recognise the **distributed-monolith** anti-pattern by *building* it.
- Make a defensible recommendation for a small team's first system.

---

## Before Class

- Have **Gitea** (v1.26.2) cloned/browsable — same codebase we've read since S11.
- Clone **`ek-ita-swa-examples`** and have Docker working (as since S8). Today uses `17-microservices-vs-monoliths/`.
- Bring one real "microservices" example — an engineering blog post, talk, or tweet. One link is enough.

---

## Today's Teachings

### Part 0 — From events to services (10 min)
S16 showed **events** as how decoupled parts coordinate without calling each other. Microservices are what happens when those parts also become **independently deployable** — separate processes, separate teams, separate release cadences. In pairs: from the example you brought, name one thing you think they *gained* by splitting and one thing they *paid*. Two pairs share.

### Part 1 — Definitions (25 min)
- **Monolith** — one deployable artefact, one repo, one runtime.
- **Modular monolith** — a monolith with strict internal module boundaries (microservice-like seams, one process).
- **Microservices** — many *independently deployable* services, owned by independent teams, talking over the network.
- The load-bearing word is **independently**: if your services must deploy together, you don't have microservices — you have a **distributed monolith**.

### Part 2 — Back in Gitea: a real modular monolith (30 min) — the set-piece
Open `services/` in Gitea: ~40 capability packages — `actions`, `auth`, `issue`, `pull`, `webhook`, `mailer`, `cron`, `mirror`, `packages`, `lfs`, `indexer`, … Each is a clear module with its own responsibility, **but they ship as one binary, share one database, and call each other in-process**. That is a modular monolith — and it runs some of the largest Git hosts in the world. Gitea chose *not* to be microservices, on purpose.

Ask your agent: *"List the top-level packages under Gitea's `services/`. Pick one that could plausibly become its own service — what does it get today for free (an in-process function call? a shared transaction? a foreign key?) that it would have to replace with a network call?"* Then open the package and check.

### Part 3 — Run the split: the same product, two shapes (35 min) — set-piece 2
In `ek-ita-swa-examples/17-microservices-vs-monoliths/` the **same notes app** (a note shows its author's name) is built twice:

- `monolith/` — one FastAPI app, one Postgres. The author lookup is an **in-process call**; `author_id` is a real **foreign key**. One `docker compose up`, one deploy.
- `microservices/` — a **`users-service` (Kotlin/Ktor)**, a **`notes-service` (Python/FastAPI)**, and a **`gateway` (Go/net-http)**, each with its own database, talking over HTTP. The author lookup is now a **network call** (`notes-service/app/users_client.py`).

Run both — they expose the **same API** on `localhost:8080`; a client can't tell them apart until something breaks. The one line that tells the whole story:

```bash
grep -rn "find_by_id" monolith/app/notes.py        # monolith: an in-process function call
grep -rn "httpx"      microservices/notes-service/  # microservices: the same lookup over the network
```

**Polyglot:** the monolith is one runtime; the microservices mix **three languages — Kotlin (users), Python (notes), and Go (gateway)** — because services integrate over a *contract*, not shared code. Each is written in its own stack without touching the others; the contract holds, so the choice doesn't ripple. A monolith can't do that. (Go is also the language of Gitea, the codebase you've read across the systems half.)

### Part 4 — What it buys, what it costs — in running code (25 min)
Buys (run it):
- **Failure isolation** — `docker compose stop users-service`; `/notes` still serves, author shows `unavailable`. The monolith's author lookup *can't* fail on its own.
- **Independent deployment** — `docker compose up -d --build notes-service` rebuilds one service.
- **Technology diversity** — Kotlin, Python, and Go side by side.

Costs (see it):
- **Distributed-systems hard problems** — the network call can time out; retries need **idempotency** (S10/S16).
- **No cross-service transaction or foreign key** — the microservices `author_id` is a bare number; nothing guarantees the author exists.
- **Operational complexity** — five containers and two databases vs one and one.
- **Debugging** — a request now spans services; you'd need distributed tracing to follow it.

### Part 5 — The distributed-monolith trap, and honest middle paths (20 min)
The graceful degradation in `users_client.py` is a *choice*. Delete the `try/except` and the timeout and a slow users-service drags notes-service down with it: now you have all the cost of microservices **and** coupled availability — a **distributed monolith**, the worst of both. (Investigation Prompt 3 builds exactly this.)

The honest guidance:
- **Start with a modular monolith** — like Gitea. Extract a service only when the pain is real and specific.
- **One service per team, not one service per concept.**
- Use the **strangler-fig** pattern to migrate incrementally, never big-bang.

### Part 6 — Workshop + synthesis (15 min)
In pairs, take the company example you brought. Sketch it at a high level: where did microservices likely help, where do you suspect they hurt? Synthesis: the S16–19 project block is deliberately a **modular monolith** — now you know why.

---

## Exercise

Take the API + data model from sessions 10–13. Half a page:

- Monolith, modular monolith, or microservices? Be specific about **who the team is** and **what the deploy cadence is**.
- Name the **one service you'd extract first** — and what it would *lose* in the split (a foreign key? a transaction? an in-process call?).

Bring it to session 18.

---

## Investigation (after class)

Ask your agent, **verify against the code**, write it up. Pick **two** of the three.

### Prompt 1 — Where would you cut Gitea?
> "List the top-level packages under Gitea's `services/`. Pick one that could become a standalone service. What does it currently get in-process (a function call, a shared DB, a transaction, a foreign key) that would become a network call or a consistency problem if extracted?"

**Verify:** open the package. Name one specific thing that would get harder across a network boundary.

### Prompt 2 — Run the failure
> "In `ek-ita-swa-examples/17-microservices-vs-monoliths/microservices`, what happens to `GET /notes` vs `GET /users` when the users-service is stopped?"

**Verify:** `docker compose up --build`, then `docker compose stop users-service`. Hit both endpoints. Read `notes-service/app/users_client.py` and explain *why* notes degrades but doesn't die.

### Prompt 3 — Build a distributed monolith
> "How would I turn this microservices example *into* a distributed monolith?"

**Verify:** remove the `try/except` and timeout in `users_client.py`, rebuild, stop users-service, hit `/notes`. What breaks now? In one sentence: what did you destroy, and which of microservices' costs did you keep?

### Deliverable

Half a page:

- **What I investigated** — which two prompts.
- **One claim the agent got right** — and the file/symbol that proves it.
- **One claim that was vague, wrong, or oversold** — and how you checked.
- **One trade** — in your own words: something splitting into services made better, and something it made worse.

Bring it to session 18. First 10 minutes we compare.

---

## Optional

- [optional] Fowler, M. — *Microservice Trade-Offs* (~15 min) — the canonical balanced framing.
- [optional] Newman, S. — *Building Microservices* — the standard reference.
- [optional] Tilkov, S. — *Don't start with a monolith… ok, do start with a monolith* (both positions, sequentially).
- [optional] Read a real microservices system *at scale* with your agent and contrast it with Gitea's modular monolith: **Online Boutique** (`GoogleCloudPlatform/microservices-demo` — polyglot, gRPC) or **Spring PetClinic-microservices** (Spring Cloud — gateway, discovery, per-service DB).
