# Session 4: Hexagonal Architecture (Ports & Adapters)

**ITA Software Architecture 2026 Fall | 3 hours**

> A reaction to the worst failure modes of layered architecture. The core of your application should know nothing about the database, the web framework, or the message queue. Everything external is plugged in through a "port" — an interface the core defines on its own terms.

---

## Learning Goals

- Define **ports** and **adapters** in your own words.
- See why the dependency direction (inward, toward the core) is the whole point.
- Refactor a small layered example into a hexagonal one.
- Understand why hexagonal architecture pays off most when tests, swappable infrastructure, or long-lived domain logic matter.

---

## Before Class

- Read: a short article on hexagonal architecture (teacher-provided).
- Bring last session's "layered with red dots" diagram.

---

## Today's Teachings

### Part 1 — The core idea (30 min)
- The **core** (or domain) is at the centre.
- Everything outside the core is an adapter (HTTP, database, file system, email, third-party API).
- The core defines **ports** — interfaces — that adapters implement.
- All dependencies point **inward**.

### Part 2 — Why this is different from layered (30 min)
- Layered: the domain depends on the database.
- Hexagonal: the database depends on the domain.
- Result: you can swap, mock, or stub everything outside the core.

### Part 3 — A worked example (45 min)
Walk through a small order-management example, transforming it from layered to hexagonal step by step. Highlight: the imports change direction. That's the real signal.

### Part 4 — Refactor exercise (60 min)
In pairs, take a small layered code sample (teacher-provided). Identify the core. Define ports. Move the adapters out. Write one test against the core that runs without touching any infrastructure.

---

## Exercise

Pick one of your own projects (or an open-source one). Identify what would be **the core** if you were rewriting it hexagonal-style. Half a page.

---

## After Class

- Hexagonal is one of three closely-related styles (also: Onion, Clean Architecture). Skim the differences — they overlap heavily.
- Next session pivots to **REST API architecture**. The hexagonal "primary adapter" for the web is exactly the kind of thing REST is about.

## References

- Cockburn, A. — *Hexagonal Architecture* (the original 2005 article).
- Vernon, V. — *Implementing Domain-Driven Design*, ch. 4.
