# Curriculum — Software Architecture (ITA, Fall 2026)

**EK Business Academy Copenhagen** · 32 sessions × 3 hours

This course teaches software architecture as **decisions, boundaries, and conventions** — the rules a
system commits to so it can grow without collapsing under its own weight. Rather than drawing diagrams,
you'll **read real systems with an AI coding agent**, design small ones of your own, and learn to defend
your choices.

> **Method in one line:** read *structure*, not syntax. You'll open large real codebases (in languages
> you may not know) and use an agent to map how they're built — then verify its claims against the code
> yourself.

---

## What you'll do every teaching session

Each teaching-session README follows the same shape:

1. **Before Class** — a short reading or setup task.
2. **Part 0 — compare notes** — 10 min comparing last session's investigation with a partner.
3. **Today's Teachings** — the concepts, anchored to a *set-piece* in a real codebase you can open.
4. **Exercise** — an in-class task on your own project.
5. **Investigation (after class)** — ask your agent a question, **verify it against the code**, write up half a page.
6. **Optional** — canonical readings, never required (hands-on first).

---

## What you need

- A laptop with **Docker** (used from Session 8 onward to run examples).
- An **LLM coding agent** (e.g. Claude Code) — the course's core tool.
- **Git / GitHub**, and the three codebases below cloned or browsable.

### The codebases you'll read

| Codebase | Role | Where it's used |
|---|---|---|
| `mistral-vibe-ek-ita` | The **spine** — a small CLI agent, the first real codebase you read | Sessions 6–9 |
| **Gitea** (pinned `v1.26.2`) | The **systems-half anchor** — a real server-side, multi-user, data-backed system | Sessions 11, 14–17, 22 |
| `ek-ita-swa-examples` | **Runnable** minimal examples (`docker compose up`) | Sessions 8, 9, 17 |

---

## Session overview

Teaching runs **Sessions 6–24**; the exam project is **Sessions 25–32**. (Sessions 1–5 are reserved/empty
slots and carry no content.)

| # | Topic | What you do |
|:-:|-------|-------------|
| 1–5 | *(reserved / empty)* | No content — placeholder slots. |
| 6 | **Intro to software architecture** | "Where is the architecture?" in real and toy systems. Set up your agent + the spine repo. |
| 7 | **Quality attributes** | Performance, scalability, availability, security, maintainability, cost — and the trade-offs between them. Quality-attribute *scenarios*. |
| 8 | **Layered architecture** | Identify layers in a real codebase; the downward dependency rule. Runnable bilingual (Kotlin + Python) notes service. |
| 9 | **Hexagonal architecture (ports & adapters)** | Refactor the notes service so dependencies point *inward*; ports and adapters. Vibe's `APIAdapter` as the live set-piece. |
| 10 | **REST API I** | Probe a real API (GitHub) hands-on; REST constraints, resources, methods, status codes, idempotency. |
| 11 | **API contracts & OpenAPI** | The contract as a generated, CI-checked artefact — read Gitea's OpenAPI. *(Gitea is introduced here.)* |
| **12–13** | **Mini-project: design a REST API** | *No teaching.* Design an API, building on Sessions 10–11. |
| 14 | **Data architecture** | Read Gitea's data model in code (schema as ORM tags), migrations & expand–contract, normalisation vs denormalisation, read/write asymmetry. |
| 15 | **Caching & performance** | Gitea's cache-aside layer, Redis vs in-memory backends, the hard problem of invalidation, latency budgets. |
| 16 | **Event-driven architecture** | Gitea's queue (one port, three brokers) and the event fan-out to webhooks; queues vs pub/sub, delivery & ordering guarantees. |
| 17 | **Microservices vs monoliths** | Gitea as a real *modular monolith*; run the same product as a monolith vs **polyglot** microservices (Kotlin + Python + Go). Failure isolation; the distributed-monolith trap. |
| **18–21** | **Project: small distributed system** | *No teaching.* Build a modular monolith, applying Sessions 14–17. |
| 22 | **Security architecture** | Gitea's authentication as a port with many adapters and its ordered, default-deny authorization model. OWASP Top 10, trust boundaries, secrets, STRIDE. |
| 23 | **Documentation: ADRs & the C4 model** | Record decisions as ADRs; draw diagrams that survive contact with reality. |
| 24 | **Synthesis: real-world architectures** | Read two real architectures with the whole semester's vocabulary and weigh their trade-offs. |
| **25–32** | **Exam project** | *No teaching.* Design and partially implement a system of your choice; present and defend it at the exam. |

---

## Projects & exam

- **Mini-project (12–13)** — design a REST API; the spec you write feeds the rest of the semester.
- **Mid-semester project (18–21)** — a small distributed system, built as a **modular monolith** (not microservices — Session 17 is the *why*).
- **Exam project (25–32)** — the assessment. You design and partially implement an architecture for a system of your choice, then present and defend it. The exam exercises every concept introduced across the semester.

---

## How to read this course

- **Hands-on first.** Engage with the in-class activity and the after-class investigation before the optional readings.
- **Verify everything.** When the agent tells you how a system works, open the file and check. The habit *is* the skill.
- **Shape over language.** You'll read Go (Gitea), Python and Kotlin (the spine and examples), and a Go gateway — because architecture is about structure, which survives the choice of language.
