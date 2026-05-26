# Session 4: Hexagonal Architecture (Ports & Adapters)

**ITA Software Architecture 2026 Fall | 3 hours**

> Layered told us where the lines should go. Hexagonal asks a sharper question: *who depends on whom across those lines?* The answer flips one of the arrows — and the codebase you've been reading for three weeks has been doing this all along.

---

## Learning Goals

- Define a **port** and an **adapter** in your own words.
- See why hexagonal's defining property is **dependency direction pointing inward** — and how that's the same diagnostic we used for layered, just rotated.
- Read Vibe's `core/llm/backend/` and recognise the ports-and-adapters shape in real, working code.
- Compare the S3 layered notes example to its hexagonal refactor — one inversion, visible in the imports.
- Name the quality attributes hexagonal buys, the ceremony it costs, and when *not* to reach for it.

---

## Before Class

- Bring your S3 investigation deliverable — we open by comparing.
- Have Vibe running and `vibe/core/llm/backend/` bookmarked. We'll open `base.py` together.
- [optional] One sentence: a place in the codebase you brought to S3 where "swap the database" or "add a second integration" would be expensive. That's a candidate for a port.

---

## Today's Teachings

### Part 0 — Compare notes from S3 (10 min)
Pairs swap S3 investigation deliverables. Each pair surfaces one layering claim Vibe got right *with file/import evidence* and one place it over-claimed. Two pairs share. Quick.

Then re-read the cliffhanger from last week: *Vibe's `core/` isn't layered. It's structured around adapters over multiple LLM vendors.* Today we name the shape.

### Part 1 — Ports & adapters (25 min)

A **port** is an interface defined by the core, on the core's terms. It describes *what* the core needs, never *how* it's provided.

An **adapter** is an implementation of a port, living outside the core. One port can have many adapters: a Postgres adapter, a SQLite adapter, an in-memory adapter. Same contract, different implementations.

The rule that *makes* this hexagonal: **all dependencies point inward, toward the core.**

- The core does not import the adapters.
- The adapters import the core (specifically: the port).
- The **composition root** — typically `Main.kt` / `main.py` — is the single place that knows about both sides and wires them together.

Diagram on the board: a hexagon in the centre (the core). Driving adapters on the left (HTTP handlers, CLI, test harnesses). Driven adapters on the right (databases, third-party APIs, file systems). Every arrow points at the hexagon.

Note the symmetry with S3:
- S3: dependencies point *down* — that's what makes a stack layered.
- S4: dependencies point *in* — that's what makes a system hexagonal.

Same diagnostic property (**dependency direction**, S3), different rule. You already have the verification habit — grep the imports.

Connecting to earlier vocabulary:
- A port is the most disciplined kind of **contract** (S1) we've seen so far — owned by the core, implemented by everyone else.
- The arrows still cross **boundaries** (S1) and the "arrows point inward" rule is still a **convention** (S1) the system commits to.
- "I can run my service tests without a database" is a **testability** claim (S2).
- "Swap one integration without touching the core" is a **maintainability** claim (S2).
- And the ceremony — every external dependency now has an interface and at least one implementation — is a real **cost** (S2).

Two flavours, named in passing:
- **Strict hexagonal** — every external interaction goes through a port.
- **Pragmatic hexagonal** — only the painful or swappable boundaries get ports.

Most real systems are pragmatic. Pure hexagonal is a textbook ideal; pragmatic hexagonal is what ships.

### Part 2 — Vibe's `core/llm/backend/` is the canonical example (35 min)
Open three files in order. Follow along in your editor.

**1. `vibe/core/llm/backend/base.py`** — read the `APIAdapter` Protocol out loud.

```python
class APIAdapter(Protocol):
    endpoint: ClassVar[str]
    def prepare_request(self, ...) -> PreparedRequest: ...
    def parse_response(self, data, provider) -> LLMChunk: ...
```

This is the **port**. The core says: *anyone who wants to be an LLM backend must implement these two methods.* The core does not care who.

**2. `vibe/core/llm/backend/anthropic.py` and `vibe/core/llm/backend/mistral.py`** — open both, side by side. Two **adapters**. Two vendors. One shape. The port is upstream of them; they depend on it, not the other way around.

**3. `vibe/core/llm/backend/factory.py`** — the selector. At composition time, given config, hand back the right adapter.

Now verify. Ask Vibe:

> "In `vibe/core/llm/backend/`, list every import in `base.py`, `anthropic.py`, and `mistral.py`. Summarise: which way do dependencies flow?"

Open one of the files Vibe names. The expected pattern: vendor files import from `base.py` and `vibe.core.types`. `base.py` imports neither vendor. **The arrows point inward.**

Bridge to S3: last week we saw the *outer* arrows (`cli/` → `core/`) point downward. Today we saw the *inner* arrows (vendor adapters → port) point inward. **The two rules — layered and hexagonal — are the same diagnostic property applied to different parts of the same codebase.** Vibe uses both, deliberately.

Park this question for Part 4: *What would it take to add a sixth LLM vendor — a local Ollama backend?* Hold the question.

### Part 3 — The S3 notes service, refactored (45 min)
The runnable example again, this time with one inversion. Both versions sit side by side in the examples repo:

```bash
git clone <examples repo url>
cd ek-ita-swa-examples/04-hexagonal-architecture/example-kotlin   # or example-python
docker compose up --build
```

The single change to see:

```
S3 layered:    application/  →  persistence/NoteRepository  (concrete class)
S4 hexagonal:  application/  →  domain/NoteRepository       (interface / Protocol)
               persistence/PostgresNoteRepository  ─────────↑ (implements the port)
```

Three things to look at in the diff:

- **Where the port lives.** Kotlin: `domain/NoteRepository.kt` is now an interface. Python: `domain/repository.py` is a `Protocol`. The application layer imports the *port*, not the concrete class.
- **A second adapter.** Both examples now ship an `InMemoryNoteRepository` alongside the Postgres one. The pay-off is a unit test: `NoteService` is exercised in milliseconds with no Docker, no schema, no network.
- **The composition root.** `Main.kt` / `main.py` is the only file that knows both halves. It picks an adapter and hands it to the service.

Verification with `grep`, mirroring the S3 move:

```bash
# S3 layered: this returns a hit (application imports the concrete repo)
grep -rh "import.*persistence" example-kotlin/src/main/kotlin/com/example/notes/application

# S4 hexagonal: this returns nothing (application doesn't import persistence at all)
grep -rh "import.*persistence" example-kotlin/src/main/kotlin/com/example/notes/application
```

Same tool, opposite question. The rule is visible by what *isn't* there.

Now answer the parked question. Adding an Ollama backend to Vibe is *one new file* — `ollama.py` next to the others, implementing `APIAdapter`, registered in `factory.py`. The core does not change. That's the operational pay-off of ports.

### Part 4 — What it buys, what it costs (25 min)
Hexagonal buys:

- **Testability.** The service runs against in-memory adapters in unit tests, real ones in integration tests. Two test pyramid layers fall out for free.
- **Maintainability.** Swap an integration without touching the core. Vibe's five vendor files are the strongest possible demonstration.
- **Replaceability.** The most common real-world driver: "we might move off Postgres / off Stripe / off SendGrid." Ports buy optionality.

Hexagonal costs:

- **Ceremony.** Every external dependency becomes an interface plus at least one implementation. Count the new files in the S4 example vs S3 — that's the literal cost.
- **Indirection.** A reader following a request from HTTP to database now stops twice — at the port and at the adapter. New joiners feel this.
- **Misuse risk.** Interfaces with exactly one implementation forever are pure overhead. If the second adapter never arrives, the port didn't earn its keep.

Quick exercise: name **two QAs hexagonal buys** and **one it costs**. Compare with your neighbour.

**When *not* to reach for hexagonal:** throwaway scripts, prototypes, code that will be rewritten before it has a second integration, systems with one obvious DB and zero realistic chance of swapping it. Pragmatic hexagonal — ports at the painful boundaries only — is what most real systems land on.

### Part 5 — Bring-your-own: where would a port help? (35 min)
In pairs, using one of the bring-your-own codebases from S3.

- Identify one external dependency the codebase has — a database, a third-party API, a file system, a message queue, an email service.
- Trace the imports: does the business logic import the integration directly, or through an interface?
- If directly: what would a port look like? What would the interface contain? Who would implement it?
- If through an interface already: how many adapters exist? Would adding a second be cheap or expensive?
- One concrete suggestion: a port worth adding — or a port that's overkill and should be removed.

5-line dossier per pair. Drop it in your semester notebook.

### Part 6 — Synthesis (10 min)
One pair shares. We end with the synthesis:

- **Layered** = arrows point down. Helpful for separation, weak on testability.
- **Hexagonal** = arrows point in. Helpful for testability and replaceability, costs ceremony.
- Most real systems are *both, in different parts*. Vibe is the proof: layered between `cli/` and `core/`, hexagonal inside `core/llm/backend/`.

Bridge to next week: the HTTP layer is the **driving adapter** on the hexagonal picture — the thing that translates an external protocol into a call on the core. Next session goes deep on what makes that translation good: REST constraints, resources, methods, status codes. We've drawn the shape; next we fill in the protocol.

---

## Exercise

Pick one of your own projects (or one of the bring-your-own codebases from S3). On paper or in a diagram tool:

- Draw the hexagon for its core.
- For each external dependency, draw an arrow. Is it pointing **in** (port + adapter) or **out** (core depends on the integration directly)?
- For one outward-pointing arrow: sketch the port that would invert it. What would the interface have on it?
- One sentence at the bottom: which QA would you be buying — and what's the ceremony cost in concrete file/class count?

Bring it to session 5.

---

## Investigation (after class)

Same pattern as the last three sessions: ask, verify, write up. Pick **two** of the three.

### Prompt 1 — Vibe's LLM backends as ports & adapters
> "Open `vibe/core/llm/backend/`. List every import in `base.py` and in two of the vendor files (e.g. `anthropic.py`, `mistral.py`). Confirm or refute: the vendor files depend on `base.py`, and `base.py` does not depend on any vendor file."

**Verify:** open the files Vibe names. Do the imports it cites actually exist? Does `base.py` import any vendor module? If yes, that's a port-leak worth flagging.

### Prompt 2 — Adding a new LLM vendor
> "If I wanted to add a new LLM provider — say, a local Ollama backend — to Vibe, what files would I need to add, and what files would I need to modify? List both, and explain why the core itself wouldn't change."

**Verify:** open `vibe/core/llm/backend/factory.py`. Does Vibe's answer match what `factory.py` actually does? If Vibe claims a file would change that doesn't need to, note it.

### Prompt 3 — A missing port in your bring-your-own
> "Here's the top-level structure of [BYO repo]. Identify one external dependency the core/business logic talks to directly. Where would a port help? What would the interface look like? File paths, please."

**Verify:** open the files Vibe names. Does the direct dependency actually exist? Is the proposed port a real improvement, or would the second adapter never realistically arrive?

### Deliverable

Half a page in your semester notebook:

- **What I investigated** — which two prompts.
- **One claim my agent got right** — and the file or import that proves it.
- **One claim that was vague, wrong, or oversold** — and how you checked.
- **One QA hexagonal buys, and one it costs** — in your own words, in the context of one specific codebase you looked at.

Bring it to session 5. First 10 minutes we'll compare.

---

## After Class

- Skim ahead: session 5 covers **REST API architecture**. REST is the protocol on the *driving adapter* side of the hexagon — the thing that translates HTTP into calls on the core.
- If you didn't run the in-class example yourself, do it now. Clone the examples repo, `cd ek-ita-swa-examples/04-hexagonal-architecture/example-kotlin` (or `example-python`), and `docker compose up --build`. Then grep the application layer for any import of `persistence` — it should return nothing. That's the rule.
- [optional, keen students] Add a third adapter — a SQLite or file-backed `NoteRepository` — to one of the examples. The service code should not change. If it does, your port has a leak.

## Optional

- [optional] Cockburn, A. — *Hexagonal Architecture* (the original 2005 article). Short, readable, opinionated.
- [optional] Search the repos you brought today for "ports", "adapters", "clean architecture", "onion" — variants of the same idea you'll meet in the wild. They overlap heavily.
- [optional] Vernon, V. — *Implementing Domain-Driven Design*, ch. 4. For students curious where the deeper "domain owns the interfaces" argument comes from.
