# Session 9: Data Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> Most of what an application *does* is shuffle data between a user and persistent storage. Where that storage is, how it's shaped, how it changes over time, and how reads and writes are routed are some of the highest-leverage architectural decisions you make. Today we get the vocabulary and the trade-offs straight.

---

## Learning Goals

- Pick between relational and document storage with reasons.
- Sketch a schema and reason about normalisation vs. denormalisation.
- Plan a migration without downtime.
- Recognise the read/write asymmetries that drive almost every data-architecture decision.

---

## Before Class

- Pick one system you've worked on and try to draw its data model on paper. Note every place you weren't sure how to model something.

---

## Today's Teachings

### Part 1 — Storage families (45 min)
- **Relational** (Postgres, MySQL) — strong consistency, joins, schemas.
- **Document** (MongoDB, DynamoDB) — flexible shape, easy horizontal scaling, joins are your problem.
- **Key–value** (Redis, DynamoDB) — fast reads/writes, no querying beyond keys.
- **Wide-column** (Cassandra) — write-optimised, eventual consistency.
- **Search** (Elasticsearch, OpenSearch) — full-text and analytics over denormalised data.

The honest framing: most apps need relational for the source of truth and *maybe* one specialist store alongside it.

### Part 2 — Normalisation, denormalisation, and reads vs. writes (45 min)
- Why normalisation is the default (no duplication, single source of truth).
- Why denormalisation is sometimes correct (read amplification, query patterns).
- "Optimise for the read or for the write" — almost every data choice is about this.

### Part 3 — Schema evolution (45 min)
- Migrations as a first-class artefact.
- The "expand–contract" pattern: add new column → backfill → switch reads → drop old column.
- Expand–contract is a **deployment** discipline as much as a data one: because the database tolerates the old *and* new shape during the transition, you roll a schema change out to a *live* system in stages and never force a breaking switch. Shipping the change and switching to it become separate steps — **"deploy ≠ release", applied to data**. This is the architectural reason migrations are *planned*, not just run.
- Why "just change the column" is fine on a small app and catastrophic on a large one.
- Schema in document stores: still exists, just enforced in your code.

### Part 4 — Workshop (45 min)
In pairs, take one quality-attribute scenario from session 2 ("Black Friday checkout under 800 ms" or similar). What does it imply about data architecture? Where do you cache, denormalise, replicate? Sketch the storage layout.

---

## Exercise

Take the API you designed in sessions 5–6. Sketch the data model behind it. For each table/collection, note: who reads it (often/rarely), who writes it (often/rarely), and which queries are slow as written. Half a page.

---

## After Class

- Session 10 (caching) is the natural next step — it's mostly about hiding slow reads. Bring your "slow as written" notes.

## References

- Kleppmann, M. — *Designing Data-Intensive Applications* (the canonical reference; chapters 2, 5, 7 most relevant today).
