# Session 2: Quality Attributes

**ITA Software Architecture 2026 Fall | 3 hours**

> Last week we learned to point at the architecture. This week we ask the next question: when the system works, what makes it *good*? Fast? Safe? Cheap to change? These are the **quality attributes** — and they fight each other. Today we learn to name them, point at them in Vibe, and write requirements precise enough to actually verify.

---

## Learning Goals

- Name the quality attributes the course will use: performance, scalability, availability, security, maintainability, cost.
- Spot each of them in `mistral-vibe-ek-ita` without reading method bodies.
- Recognise quality-attribute trade-offs and articulate one in your own words.
- Turn a vague wish ("it should be fast") into a **quality-attribute scenario** — source, stimulus, environment, artefact, response, measure.
- Write three scenarios for Vibe using only this week's and last week's vocabulary.

---

## Before Class

- Bring your S1 investigation deliverable — we open the session by comparing them.
- Have your `mistral-vibe-ek-ita` clone and `vibe` working from last week.
- Bring the system you described in S1.
- [optional] One sentence: the most annoying non-functional problem in a system you've used recently.

---

## Today's Teachings

### Part 0 — Compare notes (10 min)
In pairs, swap your S1 deliverables. Each pair picks one claim Vibe got right and one it oversold. Three pairs share with the room. We keep doing this — every session opens with last week's investigation.

### Part 1 — What does "good" mean? (15 min)
Imagine Vibe ships with no bugs. Every feature works exactly as specified. Could it still be a bad product?

We brainstorm together. The answers — *slow, leaks the API key, only works on my laptop, impossible to extend* — are all real. None of them are about whether the code "works". They're about **quality attributes**: properties of the system that aren't "what it does" but "how well it does it".

The six this course cares about:

- **Performance** — how fast?
- **Scalability** — does it cope as load grows?
- **Availability** — when you need it, is it there?
- **Security** — confidentiality, integrity, availability of data.
- **Maintainability** — how cheaply can change happen?
- **Cost** — sometimes the deciding constraint.

(There are more. Portability, usability, observability. We'll meet them as they come.)

### Part 2 — The big six, anchored to Vibe (40 min)
For each QA, we'll define it and then *point* — to a folder, a file, a behaviour in Vibe.

- **Performance.** Type `vibe`. How long does it take to be ready? That's a latency you can measure.
- **Scalability.** Vibe is a single-user CLI. Be honest: scalability isn't its biggest worry. (That's a useful realisation — not every QA matters for every system.)
- **Availability.** What happens when the Mistral API is down? Does Vibe crash, retry, fail gracefully?
- **Security.** `~/.vibe/.env` holds your API key (confidentiality). The `!` shell-command shortcut means the agent can execute things on your machine (integrity, trust boundary). The agent reads files you point it at — what if a file contains a prompt injection?
- **Maintainability.** `tests/` exists. The `backend/` folder isolates one LLM vendor from another. Adding a new vendor shouldn't require touching the rest. Verify by looking at the folder.
- **Cost.** Every prompt is API tokens. You'll feel this directly this semester.

The six are not a checklist. They're **lenses** — the same system, read six different ways.

### Part 3 — Trade-offs are mandatory (35 min)
Quality attributes fight each other. Vote first, discuss after:

- **Performance vs maintainability.** Vibe could cache aggressively to start instantly — at the cost of more code paths and staler results. Worth it?
- **Security vs performance.** Every prompt could be scanned for injection. Cost: latency. Worth it?
- **Portability vs cost-of-build.** PyInstaller + uv + Nix triples the packaging work. Worth it?
- **Maintainability vs delivery speed.** Tests slow the first ship. Worth it?

The lesson: there is no architecture without trade-offs. Anyone telling you a design is fast *and* cheap *and* easy to change is selling you something else.

A sharper way to put last week's framing: **a decision is architectural when it commits the system to a trade-off it can't easily reverse**.

### Part 4 — From wish to scenario (35 min)
"It should be fast" is not a requirement. It's a wish. Architects turn wishes into something testable.

The shape:

> **source** → **stimulus** → **environment** → **artefact** → **response** → **response measure**

Worked example — we build this together on the board:

- Wish: *Vibe should feel fast.*
- Scenario: *A user (source) types* `vibe` *in their terminal (stimulus), on a 2-year-old laptop with a warm cache (environment). The CLI binary (artefact) launches and reaches the prompt-ready state (response) in under 1.5 seconds (response measure).*

Each slot removes ambiguity. The measure makes it falsifiable. The environment kills "well, on my machine…" arguments.

Quick exercise: turn "Vibe should be secure" into one scenario. Three pairs read theirs out. If the measure isn't measurable, we sharpen it together.

### Part 5 — Pair workshop: scenarios for Vibe (30 min)
In pairs, write **three** scenarios for Vibe:

1. One for **performance**.
2. One for **security**.
3. One for an attribute of your choice — availability, maintainability, cost, portability.

Rules:

- Use all six slots: source, stimulus, environment, artefact, response, measure.
- Each measure must be a number, a yes/no, or a named threshold. "Fast" doesn't count. "Under 200 ms p95" does.
- Each scenario should be specific enough that you could imagine writing a test for it.

Vocabulary: today's (the six QAs, *scenario*, *trade-off*) plus last week's (*component*, *boundary*, *contract*, *convention*). Not yet: layered, hexagonal, microservices — those land in the next sessions.

### Part 6 — Synthesis (15 min)
Each pair reads their hardest scenario. As a class we ask: is the measure measurable? Is the environment specified? Would two engineers agree on the outcome?

From here on, every architectural style we look at — layered, hexagonal, microservices, event-driven — gets the same question: **which quality attributes does it buy you, and what does it cost?**

---

## Exercise

Half a page in your semester notebook:

- Pick three quality attributes that matter most for your bring-your-own system.
- Write one scenario per attribute, in the six-slot shape.
- One sentence: which two of these attributes most clearly trade off against each other, and why.

---

## Investigation (after class)

Same pattern as last week: ask Vibe, verify against the repo, write up what you learned.

Pick **two** of the three:

### Prompt 1 — Which QAs does Vibe optimise for?
> "Looking at this repo, which two or three quality attributes do you think the maintainers care about most? Point to specific files, folders, or patterns that justify each claim."

**Verify:** open at least one path Vibe cites for each claim. Does the file actually evidence the attribute, or did the agent reach? Note one claim that holds up and one that's hand-wavy.

### Prompt 2 — Find a quality-attribute trade-off
> "Find one place in this codebase where two quality attributes are in tension with each other. Explain which two, and how the current design resolves the tension."

**Verify:** name the file or folder the trade-off lives in. Can you state the trade-off in your own words without the agent's phrasing? If not, it didn't land — re-ask.

### Prompt 3 — Write a scenario, then critique it
Pick one of:
- CLI startup latency.
- Behaviour when the Mistral API returns a 5xx.
- Security of the `!` shell-command feature.

Ask Vibe:
> "Write a quality-attribute scenario for [your topic] in the source → stimulus → environment → artefact → response → measure shape. Then critique your own scenario: what's vague, what's not measurable, what assumption could be wrong?"

**Verify:** does the response actually use all six slots? Is the measure a number or a yes/no? Rewrite the weakest slot yourself.

### Deliverable

Half a page in your semester notebook:

- **What I investigated** — which two prompts.
- **One claim Vibe got right** — and the file or measure that justifies it.
- **One claim that was vague, wrong, or oversold** — and how you sharpened it.
- **One quality-attribute trade-off I now see in Vibe** — one or two sentences.

Bring it to session 3. First 10 minutes we'll compare.

---

## After Class

- Skim ahead: session 3 covers **layered architecture** — the oldest mainstream style. We'll ask which of today's quality attributes it actually buys you.

## Optional

- [optional] Bass, Clements, Kazman — *Software Architecture in Practice*, chapter 4 (Quality Attributes). The canonical source for the scenario shape we used today.
- [optional] OWASP Top 10 (web edition) — useful background for the security examples; we revisit in session 17.
