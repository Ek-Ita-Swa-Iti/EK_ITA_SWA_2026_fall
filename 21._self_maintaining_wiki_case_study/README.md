# Session: The Self-Maintaining Wiki — Architecture Without a Server

**Software Architecture | One session (≈ 3 hours)**

> A case study in software architecture using a system with no database, no server, and no user interface. We'll read Andrej Karpathy's "LLM Wiki" idea file, study the architecture it implies, and build a tiny version together.

---

## Learning Goals

- Recognise architecture as **boundaries and conventions**, not just components and diagrams.
- Read a system specification written in plain English and reason about its trade-offs.
- Identify the load-bearing rule in a small system and predict what happens when it's broken.
- Understand "change detection" as a general pattern (build systems, backups, incremental updates).
- Build and inspect a working LLM-maintained wiki on your own machine.

---

## Before Class

- Read the handout **`architecture-class-handout.md`** end-to-end (about a page). It introduces the three-layer architecture and five core ideas we'll discuss in class.
- Read **Andrej Karpathy's "LLM Wiki" idea file**: <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>
  - Skim if necessary, but try to understand: what is the *raw* layer, what is the *wiki* layer, and what is the *schema*?
  - Bring one question or one objection to class.
- Install an LLM agent on your machine if you haven't already (Claude Code, Codex, OpenCode — any will do). You need it for the exercise.

---

## Today's Teachings

### Part 1 — What are we even looking at? (30 min)

Group discussion based on the Karpathy gist + handout:

- Where is the "software" in this system? Point at a file.
- What runs at runtime? (Hint: there's no daemon, no service.)
- Compare to a system you already know — a webshop, a game, a mobile app. What's the same? What's missing?

### Part 2 — Five architectural ideas (45 min)

We walk through the five ideas from the handout, one at a time, with a short discussion after each:

1. **Boundaries matter more than components.** Why can't the LLM write to `raw/`? What breaks if it does?
2. **The contract is in English.** `CLAUDE.md` plays the role a type system or API spec usually plays. When is that good enough? When isn't it?
3. **Small conventions carry the system.** The `introduces / reinforces / assumes` tag is three words long — but without it, the whole thing collapses. Where do you see this pattern in other software?
4. **Change detection.** Re-processing only what's changed (via git) is a pattern that shows up everywhere: build systems, incremental backups, hot reload. Recognise it once, see it everywhere.
5. **It's just files.** No database, no server. Discuss: what does this design buy you? What does it cost?

### Part 3 — Workshop: build a tiny LLM wiki (90 min)

In pairs. Goal: a working, smallest-possible version of Karpathy's idea.

1. Create a folder structure:
   ```
   my-wiki/
     raw/          # 2–3 articles or PDFs you find interesting
     wiki/
     CLAUDE.md     # your contract
   ```
2. Write your own `CLAUDE.md` from scratch. **Don't copy Karpathy's directly** — write what *you* think the LLM needs to know. Keep it short.
3. Drop two source files into `raw/`. Tell your LLM agent: *"Ingest these following the rules in CLAUDE.md."*
4. Read what the LLM wrote. Did it follow your rules? Where did it improvise? Where did it get confused?
5. **Iterate on `CLAUDE.md` based on what went wrong.** This is the real exercise — refining an English contract until the LLM behaves the way you want.

You will probably revise `CLAUDE.md` four or five times. That's the point.

### Part 4 — Debrief (15 min)

- Whose wiki produced the most useful output? Read their `CLAUDE.md`. Why did it work?
- Where did your `CLAUDE.md` fail? Could the same problem be fixed by writing more English — or did you need *code* (a checker, a validator)?
- If you had to extend this to a team of 5 people sharing one wiki, what would you change?

---

## Exercise: Take-home

Pick one of:

- **Option A — Extend your wiki.** Add a third page type to your `CLAUDE.md` (e.g. *people pages*, *timeline pages*, *contradiction pages*). Ingest two more sources and see whether the new convention holds.
- **Option B — Write a lint.** Add a `## Lint` section to your `CLAUDE.md` describing health checks the LLM should run on demand. Ask the LLM to run it. Report the findings.
- **Option C — Break it on purpose.** Edit `CLAUDE.md` to remove one rule (your choice). Ingest a new source. Document what broke. Restore the rule.

Write up half a page on what you learned and bring it to next session.

---

## After Class

- Keep your wiki. Add to it during the rest of the semester — it's a useful artefact in its own right, and a live reference for the architectural patterns we discussed today.
- If your wiki grows past 20 pages, the `index.md` + grep pattern starts to feel slow. That's a natural moment to think about *when* and *why* you'd add proper search infrastructure — a useful intuition to carry into later sessions on system scaling.

---

## References

- **Karpathy, A.** *LLM Wiki* (gist). <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>
- **`architecture-class-handout.md`** — the conceptual base for today's session.
- **Bush, V.** *As We May Think* (1945) — Karpathy references the Memex; worth a skim if you have time. The "private, actively curated, with the connections between documents as valuable as the documents themselves" idea is 80 years old.
