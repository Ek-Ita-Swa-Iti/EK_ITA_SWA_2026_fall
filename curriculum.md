# Curriculum — Software Architecture (ITA, Fall 2026)

**EK Business Academy Copenhagen** · 29 sessions × 3 hours

This course teaches software architecture as **decisions, boundaries, and conventions** — the rules a
system commits to so it can grow without collapsing under its own weight. You'll **read real systems
with an AI coding agent**, build and change small ones of your own, and learn to defend your choices.

> **Method in one line:** read *structure*, not syntax — then verify what the agent tells you against
> the code yourself.

---

## How a session works

- **IT-infrastructure foundations (Sessions 2–5)** — keyboard-first: setup, live teachings, and an
  in-class exercise you commit to Git.
- **Architecture reading (Sessions 6–10)** — *Before Class*, *Today's Teachings* anchored in a real
  codebase, an *Exercise*, and an *Investigation (after class)*: ask your agent, **verify against the
  code**, write it up.
- **Building on the notes-service (Sessions 9–12, 18–19)** — the small layered Node.js notes-service
  from Session 9 is the running project. Each session adds to it: a new persistence layer, an API
  other pairs depend on, an OpenAPI contract, semantic search. From Session 11 the material is in
  Danish and opens with *Dagens spørgsmål*, followed by demos and *Miniøvelser*.
- **Optional** readings are never required — hands-on first.

---

## What you need

- A laptop with **Docker Desktop** (introduced in Session 2, used throughout).
- An **LLM coding agent** (e.g. Claude Code, Mistral Vibe) — the course's core tool.
- **Git / GitHub**, and **Insomnia** as HTTP client (from Session 11).

### The code you'll work with

| Code | Role | Where it's used |
|---|---|---|
| `mistral-vibe-ek-ita` | The **spine** — a small CLI agent, the first real codebase you read | Sessions 1–2, 6–8, 10 |
| `example-*` folders in the session folders | **Runnable** examples (`docker compose up`) | Sessions 8, 9, 12, 18, 19 |
| Your own **notes-service** | The system you build and change | Sessions 9, 11, 12, 19, 20 |

---

## Session overview

**Sessions 2–5** are the **IT-infrastructure foundations block**; architecture teaching runs
**Sessions 6–12** and **18–20**, with the project block at **14–17**; the exam project is
**Sessions 22–29**. Session 1 is a 3rd-semester intro session. Sessions 13 and 21 have no
material yet.

| # | Topic | What you do |
|:-:|-------|-------------|
| 1 | **Introduction to 3rd semester** | Semester overview and toolkit setup after the shared welcome — install Mistral Vibe and watch a first agent investigation. |
| **2** | **Terminal, Linux & Git** | Run a Linux machine in a container, navigate the shell, file permissions, install software with `apt`, save and push work with Git. |
| **3** | **The command line — pipes & HTTP** | stdin/stdout/stderr, pipes and the text toolkit; `curl` and just enough HTTP; an authenticated request with a bearer token. |
| **4** | **Networking — how services talk** | Ports and listening processes, `localhost`/`0.0.0.0`, DNS, the client–server round-trip; why the network is unreliable. |
| **5** | **Docker, Compose & the cloud** | Images vs containers, write a `Dockerfile`, multi-service `docker compose`; on-prem vs cloud (IaaS/PaaS/SaaS). **Mandatory group assignment** issued. |
| 6 | **Intro to software architecture** | "Where is the architecture?" in `mistral-vibe-ek-ita`: decisions, boundaries, conventions. Ask the agent, then check. |
| 7 | **Quality attributes** | Performance, scalability, availability, security, maintainability, cost — the trade-offs, and quality-attribute *scenarios*. |
| 8 | **Layered architecture** | Layers and the downward dependency rule; is Vibe layered? Runnable notes service in Kotlin, Python and Node. |
| 9 | **Layered architecture (hands-on)** | Live demo of a minimal two-layer Node.js notes-service, then swap its persistence layer yourself — to a JSON API and to MongoDB in Docker. |
| 10 | **REST API I** | Probe GitHub's API hands-on: resources, methods, status codes, the REST constraints. |
| 11 | **Når andre afhænger af dit API** | Pairs use each other's notes-service without reading the code, then change it: the API contract, breaking vs non-breaking changes, versioning, useful error responses. |
| 12 | **Skriv kontrakten ned · OpenAPI** | Write the notes-service contract as an OpenAPI spec, serve it with Swagger UI, and check it against the real API. |
| **14–17** | **Project: small distributed system** | *No teaching.* Build a modular monolith, applying the architecture concepts from the course so far. |
| 18 | **Dataarkitektur · Søg på betydning** | Embeddings and vector databases: a side-by-side search engine (MySQL `LIKE` vs Qdrant), music in Spotify, and your own embeddings with Ollama. |
| 19 | **Dataarkitektur 2 · Semantisk søgning** | A full-day tutorial: add Ollama and Qdrant to your notes-service in the right layers. MongoDB is the source of truth; Qdrant is an index you can rebuild. |
| 20 | **Sikkerhedsarkitektur · Hvor ligger jeres *secrets*?** | Hunt down the secrets you've used all semester; authentication vs authorisation (`401` vs `403`), tokens with scopes and expiry; give your notes-service its own API key; what to do when a secret leaks — revoke first. |
| **22–29** | **Exam project** | *No teaching.* Each group finds a real project at a real customer, maps the company's architecture, then designs, implements, and defends an architecture of their own choosing. |

---

## Projects & exam

- **Foundations group assignment (issued S5, "Containerised Toolbox")** — a small runnable `docker compose` project (a group-written bash tool + `Dockerfile` + a 2-service compose file, on GitHub). Pass/needs-rework; ties together the infrastructure block.
- **Mid-semester project (14–17)** — a small distributed system, built as a **modular monolith**.
- **Exam project (22–29)** — the assessment. Each group finds a real project at a real customer, maps the company's architecture, then designs, implements, and defends an architecture of their own choosing, before presenting and defending it at the exam.

---

## How to read this course

- **Hands-on first.** Engage with the in-class activity before the optional readings.
- **Verify everything.** When the agent tells you how a system works, open the file and check. The habit *is* the skill.
- **Shape over language.** You'll read Python and Kotlin (the spine and examples) and write JavaScript (the notes-service) — because architecture is about structure, which survives the choice of language.
