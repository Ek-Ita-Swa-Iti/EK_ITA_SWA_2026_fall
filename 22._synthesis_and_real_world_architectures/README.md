# Session 22: Synthesis — Reading Real-World Architectures

**ITA Software Architecture 2026 Fall | 3 hours**

> The last teaching session before the exam project. Today we don't introduce new content. We use everything from the semester to read two real-world architectures, judge them, and rehearse the kind of reasoning the exam will ask for.

---

## Learning Goals

- Apply the semester's vocabulary fluently when reading an unfamiliar system.
- Recognise the architectural trade-offs a real company has made and reason about why.
- Identify what's *missing* from a public architecture description.
- Rehearse the kind of architectural discussion you'll have in the exam.

---

## Before Class

- Skim **one** real-world architecture write-up (≤10 min) — anything that interests you. A starter menu in `## Optional` below, or bring your own. Note one thing you didn't understand.
- Come ready to nominate a system you'd like the class to read together.

---

## Today's Teachings

### Part 1 — Group reading (60 min)
For each of the two articles students read, do a structured walk-through:
- What are the main components? (Container-level C4.)
- What quality attributes is this architecture optimising for?
- What's the most interesting trade-off?
- What would you have done differently with their constraints?

### Part 2 — Vocabulary check (45 min)
A live exercise: the teacher names a concept from the semester, students point at where it appears in one of the articles. Examples: trust boundary, cache invalidation, idempotency, eventual consistency, ADR-worthy decision, microservices vs. modular monolith.

If a concept never lands, that's a teaching gap — note it.

### Part 3 — The exam pitch format (45 min)
The exam project asks students to design and partially implement a system. Today we rehearse the *presentation* shape:
- What is the system? (One sentence.)
- What are the major architectural decisions? (Three.)
- For each: alternatives considered, choice made, consequences.
- What would you do next if you had another month?

In pairs: give a 5-minute mock pitch for one of the two articles you read, as if it were your project.

### Part 4 — Q&A and exam prep (30 min)
Open floor: questions about the exam project (sessions 23–30). The teacher answers; students take notes.

---

## Exercise

Pick one of the two articles. Write half a page on what *quality attribute scenario* (session 2 vocabulary) you think is the load-bearing requirement that drove its architecture.

---

## After Class

- Sessions 23–30 are exam project work. The next time the teacher gives input is at the exam itself.

## Optional

- [optional] Stack Overflow's architecture overview.
- [optional] How Discord stores trillions of messages.
- [optional] How GitHub builds GitHub.
- [optional] The Netflix microservices migration.
- [optional] How Figma's multiplayer works.
