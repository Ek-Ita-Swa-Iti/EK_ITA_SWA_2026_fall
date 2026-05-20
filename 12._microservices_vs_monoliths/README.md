# Session 12: Microservices vs. Monoliths

**ITA Software Architecture 2026 Fall | 3 hours**

> Few topics in software architecture generate more heat and less light. Today we look honestly: what microservices actually buy you, what they actually cost, and why most teams that "needed" microservices probably didn't.

---

## Learning Goals

- Define monolith, modular monolith, and microservices precisely — not as vibes.
- Identify the forces (organisational, technical, operational) that push toward each.
- Recognise the "distributed monolith" anti-pattern.
- Make a defensible recommendation for a small team's first system.

---

## Before Class

- Read: Martin Fowler's *Microservice Trade-Offs* (or a similar honest piece).
- Bring an example of a "microservices" architecture from a real company (engineering blog post, conference talk).

---

## Today's Teachings

### Part 1 — Definitions (30 min)
- **Monolith**: one deployable artefact, all the code in one repo, one runtime.
- **Modular monolith**: a monolith with strict internal module boundaries.
- **Microservices**: many independently-deployable services, owned by independent teams, communicating over the network.
- Note the word "independently" — if your services deploy together, you don't have microservices, you have a distributed monolith.

### Part 2 — What microservices actually buy (45 min)
- **Independent deployment** — team A ships without coordinating with team B.
- **Technology diversity** — Java service over here, Python service over there.
- **Failure isolation** — one service down doesn't take the whole system.
- **Independent scaling** — scale the bit that's hot.

### Part 3 — What microservices actually cost (45 min)
- Distributed systems are *hard*: network calls fail, partial failures, retries, idempotency.
- Operational complexity: many more things to monitor, deploy, secure, configure.
- Data consistency: forget cross-service transactions.
- Debugging: stack traces now require distributed tracing.
- The team-shape requirement: you need many teams, not many services.

### Part 4 — Honest middle paths (30 min)
- Start with a modular monolith. Extract a service only when the pain is real and specific.
- "One service per team," not "one service per concept."
- The strangler-fig pattern for migrations.

### Part 5 — Workshop (30 min)
In pairs, take the company example you brought. Sketch their architecture (high level). Discuss: where did microservices likely help them? Where do you suspect it hurt?

---

## Exercise

Take the API + data model from sessions 5–10. Write half a page on whether you'd build it as a monolith, a modular monolith, or microservices — and why. Be specific about who the team is and what the deployment cadence is.

---

## After Class

- Sessions 13–16 are the next project block. The system you build there will probably be a modular monolith. Today's session is the why.

## References

- Fowler, M. — *Microservice Trade-Offs*.
- Newman, S. — *Building Microservices* (the standard reference).
- Tilkov, S. — *Don't start with a monolith… ok, do start with a monolith* (both positions, sequentially).
