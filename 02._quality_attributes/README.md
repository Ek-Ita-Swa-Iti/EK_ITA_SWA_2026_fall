# Session 2: Quality Attributes

**ITA Software Architecture 2026 Fall | 3 hours**

> What does "good" mean when you can't just say "it works"? Quality attributes are the non-functional properties an architecture commits to — performance, scalability, security, maintainability, and others. Most architectural decisions are quality-attribute trade-offs in disguise.

---

## Learning Goals

- Name and define the main quality attributes used in industry.
- See that quality attributes **conflict** — improving one usually costs another.
- Convert vague requirements ("must be fast") into testable architectural targets ("99th percentile under 200 ms at 1000 req/s").
- Recognise quality-attribute trade-offs in architectural decisions you make in later sessions.

---

## Before Class

- Pick one app or service you use frequently. Write down three things you'd complain about if they got worse.
- Glance at the "quality attributes" or "non-functional requirements" Wikipedia page.

---

## Today's Teachings

### Part 1 — The big six (and a few more) (45 min)
- **Performance**: latency vs. throughput.
- **Scalability**: vertical vs. horizontal.
- **Availability**: uptime, SLOs, the meaning of "99.9%".
- **Security**: confidentiality, integrity, availability (the CIA triad).
- **Maintainability**: how cheaply can change happen.
- **Usability**: includes developer experience.
- Plus: portability, observability, cost.

### Part 2 — Trade-offs are mandatory (45 min)
Walk through three examples where improving one attribute hurts another:
- Cache aggressively → faster, but stale data risk.
- Replicate the database → highly available, but consistency hard.
- Strict input validation → more secure, but slower and harder to evolve.

### Part 3 — From wish to scenario (45 min)
A "quality attribute scenario" is the technique. The shape: *source → stimulus → environment → artefact → response → response measure.*

Worked example:
> "*A user (source) submits a checkout (stimulus) during peak Black Friday traffic (environment) to the payments service (artefact). The service responds with a confirmation (response) within 800 ms at the 99th percentile (response measure)."*

### Part 4 — Workshop (45 min)
In pairs, take a system from session 1's homework. Write three quality-attribute scenarios for it. Identify which two are in tension.

---

## Exercise

Pick one of your three scenarios. Write half a page on what *architectural* choices would help meet it — and what they cost you elsewhere.

---

## After Class

- Keep your scenarios. They'll resurface in later sessions on caching, scaling, and security.

## References

- Bass, Clements, Kazman — *Software Architecture in Practice*, ch. 4 (quality attribute scenarios).
