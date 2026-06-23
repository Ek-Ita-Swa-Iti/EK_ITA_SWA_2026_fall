# Session 23: Documentation — ADRs and the C4 Model

**ITA Software Architecture 2026 Fall | 3 hours**

> Most architecture documentation is wrong, out of date, or both. The two ideas in today's session — **ADRs** for capturing decisions and the **C4 model** for diagrams at four useful zoom levels — are practical, cheap, and survive contact with reality. If you only adopt two documentation habits, make it these.

---

## Learning Goals

- Write an Architecture Decision Record (ADR) for a real decision.
- Draw a system at the C4 model's four levels: Context, Container, Component, Code.
- Recognise the documentation that's worth writing vs. the documentation that rots.

---

## Before Class

- Find **one** ADR in a public GitHub repo (try a code search for `decisions/` or `adr/`). Skim it — ~5 min.
- Find **one** C4 diagram online and note which of the four levels it is.

---

## Today's Teachings

### Part 1 — Why most architecture documentation fails (15 min)
- Word documents nobody opens.
- Wiki pages that drift from the code.
- "Tribal knowledge" that walks out the door.
- The fix isn't more documentation; it's documentation that's small, versioned, and close to the code.

### Part 2 — ADRs (60 min)
An Architecture Decision Record is a short markdown file capturing one decision. Structure:
- **Title**
- **Status**: proposed / accepted / superseded
- **Context** — what's the situation that forces a decision?
- **Decision** — what did we decide?
- **Consequences** — what does this buy us, and what does it cost?

Write one together as a class for a decision the teacher's done before.

Then in pairs: write an ADR for a decision you made in sessions 10–11 or 9. Half a page.

### Part 3 — The C4 model (60 min)
Simon Brown's four levels, from zoomed-out to zoomed-in:
1. **Context** — the system as a box, with external users and other systems. *Audience: everyone.*
2. **Container** — the runtime pieces (web app, API, database, queue). *Audience: developers and ops.*
3. **Component** — the major modules inside one container. *Audience: developers in that container.*
4. **Code** — class-level. *Audience: rarely anyone; usually auto-generated.*

Most diagrams that fail try to be all four at once.

Live: draw a Context + Container diagram for the project from sessions 18–21.

### Part 4 — What not to document (15 min)
- Don't document what the code already says.
- Don't document what will be true tomorrow but not next week.
- Do document why something *isn't* there (decisions not taken are easy to lose).

### Part 5 — Workshop (30 min)
In pairs: write two more ADRs for your sessions-13–16 project. The point is to practise — quality matters less than reps.

---

## Exercise

Pick one decision in your professional or hobby life that you've made architecturally without writing it down. Write the ADR for it now.

---

## After Class

- Skim ahead: session 24 pulls the whole semester's threads together by reading two real-world architectures.

## References

- Nygard, M. — *Documenting Architecture Decisions* (the original ADR article).
- Brown, S. — [c4model.com](https://c4model.com).
- *Architecture Decision Records* repository on GitHub.
