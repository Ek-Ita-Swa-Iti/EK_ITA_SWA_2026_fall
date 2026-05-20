# Session 3: Layered Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> The oldest architectural style still in everyday use. Layers are easy to draw, easier to misuse. Today we look at when layers help, when they hurt, and how to spot a layered architecture that has quietly become spaghetti.

---

## Learning Goals

- Define a layer and the rule that makes a stack "properly" layered.
- Recognise the standard layers used in web/back-end systems (presentation, application, domain, persistence).
- Identify when layering is a useful constraint vs. when it's ceremony.
- Read a real codebase and judge whether its layers hold.

---

## Before Class

- Find an open-source project on GitHub you can read. Pick one written in a language you know.
- Look at its top-level folder structure. Try to name the layers (or argue that it doesn't have any).

---

## Today's Teachings

### Part 1 — What "layered" means (30 min)
- A layer can call **downward** only. Never upward, never sideways across layers.
- The classic web stack: presentation → application → domain → persistence.
- Strict vs. relaxed layering.

### Part 2 — Why it works when it works (45 min)
- Replacing one layer is cheap (in theory): swap Postgres for MySQL, change the HTML framework, etc.
- Each layer is testable in isolation.
- A new developer can read one layer at a time.

### Part 3 — How it falls apart (45 min)
Common failure modes:
- The "shortcut": a presentation-layer file imports something from persistence directly.
- The God-domain: business logic leaks into controllers because the domain layer is empty.
- The anaemic stack: layers exist as folders but every change touches all of them.

### Part 4 — Read a real one (45 min)
Group reading of the codebase students brought. For each:
- What are the layers, in the team's words?
- Are the rules respected?
- One concrete suggestion you'd make if you joined the team tomorrow.

---

## Exercise

Take your bring-your-own codebase. Draw its layers on paper (or in a diagram tool). Mark every place a layer is broken with a red dot. Bring it next session.

---

## After Class

- Skim ahead: next session covers *hexagonal* architecture, which is in many ways a reaction to the failure modes of layered.

## References

- Fowler, M. — *Patterns of Enterprise Application Architecture* (the classic layered reference).
