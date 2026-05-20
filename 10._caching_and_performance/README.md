# Session 10: Caching and Performance

**ITA Software Architecture 2026 Fall | 3 hours**

> "Make it fast" is a quality attribute. "Cache it" is one of the most common ways to deliver on that quality attribute — and one of the most common ways to introduce bugs that don't appear until production. Today we look at *where* to cache, *what* to cache, and the eternal hard problem: when to invalidate.

---

## Learning Goals

- Identify the cache levels that exist in a typical web stack.
- Choose a caching strategy that matches the read/write pattern.
- Recognise common cache failure modes (stampede, staleness, drift).
- Reason about latency budgets — how much time you have, where it's spent, and where caching helps.

---

## Before Class

- Read: a short article on latency numbers every programmer should know (teacher-provided).

---

## Today's Teachings

### Part 1 — Where caches live (45 min)
From client to database:
- Browser cache (HTTP `Cache-Control`).
- CDN.
- Reverse proxy (Varnish, Nginx).
- Application-level in-memory cache.
- Distributed cache (Redis, Memcached).
- Database query cache / materialised views.
Each is the right answer to a different problem.

### Part 2 — Cache strategies (45 min)
- **Cache-aside (lazy)**: app reads cache; on miss, reads DB and fills cache.
- **Write-through**: app writes to cache and DB together.
- **Write-behind**: writes go to cache, flushed to DB asynchronously.
- **Read-through**: cache fronts the DB invisibly.
Trade-offs: consistency, complexity, failure modes.

### Part 3 — The hard problem (45 min)
> *"There are only two hard things in Computer Science: cache invalidation and naming things."* — Phil Karlton

- Time-based expiry (TTL) — simple, often good enough.
- Event-based invalidation — accurate, hard to implement everywhere.
- Cache stampede / thundering herd — what it is, how to mitigate (locks, jitter, request coalescing).
- The "stale cache served forever" failure mode — and why monitoring catches it.

### Part 4 — Latency budget exercise (45 min)
A 500 ms latency budget for a page load. Distribute it across DNS, TLS, server, DB, render. Where does caching buy you the most? Where does it not help at all?

---

## Exercise

Take the API + data model from sessions 5–9. Add a caching plan: which endpoints are cached, where, with what TTL, and how invalidation works. Half a page.

---

## After Class

- Caching is also an event-driven problem (invalidation is an event). Session 11 picks that up.

## References

- Kleppmann, M. — *Designing Data-Intensive Applications*, ch. 11 on streams (relates to invalidation).
- "Latency numbers every programmer should know" (Norvig / Dean — many versions online).
