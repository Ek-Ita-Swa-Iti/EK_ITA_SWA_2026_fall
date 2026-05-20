# Session 1: Intro to Software Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> What is software architecture, really? Not the diagrams — the underlying thing the diagrams are trying to show. We'll look at real and toy systems and learn to point at the architecture in each.

---

## Learning Goals

- Be able to answer the question "where is the architecture in this system?" with something more useful than "the diagram."
- Recognise architecture as **decisions, boundaries, and conventions**.
- Distinguish architecture from implementation choices that look architectural but aren't.
- Build vocabulary for the rest of the semester: *component*, *boundary*, *contract*, *convention*, *quality attribute*.

---

## Before Class

- Bring a system you've built or worked on (a project, an internship task, a hobby app). Be ready to describe it in 2 minutes.
- Read: a one-page primer on what "software architecture" means (teacher-provided).

---

## Today's Teachings

### Part 1 — Three definitions, side by side (30 min)
- "Architecture is the parts that are hardest to change."
- "Architecture is the decisions you wish you'd made earlier."
- "Architecture is whatever the next developer needs to know."
- Discussion: which fits your bring-your-own system?

### Part 2 — Where is the architecture? (45 min)
Walk through three systems together:
- A static personal website
- A typical CRUD webshop
- A multiplayer game backend

For each: what are the components, what are the boundaries, what are the conventions? Where would a wrong decision now hurt you in a year?

### Part 3 — Architecture vs. implementation (45 min)
A useful test: would a competent engineer make the same call without reading the spec? If yes, it's implementation. If no, it's probably architectural.

Worked examples (some architectural, some not — students vote first):
- Choice of programming language
- Choice of database engine
- Naming convention for REST endpoints
- Whether to send password reset emails synchronously or via a queue

### Part 4 — Pair exercise (45 min)
In pairs, pick a system you both use daily (e.g. Spotify, a banking app, a multiplayer game). Sketch on paper: what are the major components, what are the boundaries you can infer, and what's one architectural decision the team must have made early?

---

## Exercise

Write half a page on your bring-your-own system using the framing from today: what are the components, the boundaries, and the conventions? What's one decision you'd revisit?

---

## After Class

- Set up a personal notebook (digital or paper) for the semester. You'll add to it every session.
- Skim ahead: next session covers *quality attributes* — what "good" means when you can't say "it works."
