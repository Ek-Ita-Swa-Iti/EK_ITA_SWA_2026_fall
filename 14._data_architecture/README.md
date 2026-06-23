# Session 14: Data Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> Most of what an application *does* is move data between a user and persistent storage. Where it lives, how it's shaped, how reads and writes are routed, and how it *changes over time* are some of the highest-leverage decisions you make. Today we read a real one — **Gitea's** data model expressed in code, and the 261-migration history that has evolved it on live systems without downtime.

---

## Learning Goals

- Pick between relational and document storage with reasons.
- Read a real **relational data model expressed in code** — entities, keys, indexes, relationships.
- Reason about **normalisation vs. denormalisation** through read/write patterns.
- Read a real **migration** and judge whether it's safe to apply to a *running* system (expand–contract).
- Recognise the **read/write asymmetry** that drives almost every data decision.

---

## Before Class

- Have **Gitea** (v1.26.2) cloned/browsable — same codebase we met in S11.
- Bring the data model behind the API you built in the 7–8 mini-project (a sketch is fine).
- [optional] One sentence: a place in a system you've built where you weren't sure how to model something.

---

## Today's Teachings

### Part 0 — The data behind your mini-project (10 min)
In pairs, share the data model you ended up with in the 7–8 mini-project. One thing you normalised, one thing you were tempted to duplicate. Two pairs share. Today we hold yours up against a real one.

### Part 1 — Storage families, and the relational default (25 min)
- **Relational** (Postgres, MySQL, SQLite) — strong consistency, joins, schemas.
- **Document** (MongoDB) — flexible shape, joins are your problem.
- **Key–value** (Redis) — fast, no querying beyond keys.
- **Wide-column** (Cassandra) — write-optimised, eventual consistency.
- **Search** (Elasticsearch) — full-text over denormalised data.

Honest framing: most apps — Gitea included — use **relational for the source of truth** and *maybe* one specialist store alongside (Gitea adds a search indexer, which we met in S11's fan-out).

### Part 2 — Back in Gitea: a real data model in code (30 min) — the set-piece
Open `models/issues/issue.go` and read the `Issue` struct. The `xorm:` tags on each field **are the schema**:

```go
type Issue struct {
    ID       int64                  `xorm:"pk autoincr"`          // primary key
    RepoID   int64                  `xorm:"INDEX UNIQUE(repo_index)"` // FK + index + composite unique
    Repo     *repo_model.Repository `xorm:"-"`                    // joined in memory, NOT a column
    Index    int64                  `xorm:"UNIQUE(repo_index)"`   // issue number within a repo
    PosterID int64                  `xorm:"INDEX"`                // FK to the user who opened it
    ...
}
```

Everything we'd draw on a schema diagram is here: a **primary key**, **indexes**, a **composite unique constraint** (`repo_index` — issue #5 is unique *within* a repo), **foreign keys** (`RepoID`, `PosterID`), and `xorm:"-"` for **relationships loaded by a join, not stored as a column**. And one model, several databases: `models/db/engine.go` runs the same schema on MySQL, Postgres, SQLite, or MSSQL.

Ask your agent: *"Describe the data model for a Gitea issue — its key, its indexes, and what it points at."* Then open the struct and check.

### Part 3 — Normalisation, denormalisation, reads vs. writes (25 min)
- **Normalisation is the default**: no duplication, one source of truth (the `Issue` row doesn't copy the repo's name — it stores `RepoID` and joins).
- **Denormalisation is sometimes correct**: when a read path is hot and a join is expensive, you store a derived value. Gitea keeps **counts and cached derived values** rather than recomputing them every page load.
- The lens behind both: **"optimise for the read or for the write?"** Almost every data decision is one or the other. Gitea is read-heavy (people browse far more than they write), and the model shows it.

### Part 4 — Schema evolution: migrations in the wild (30 min) — set-piece 2
A schema is never finished. Open `models/migrations/` — version folders `v1_6` … `v1_26`, holding **261 numbered migration files**, each a small function that changes the schema. `migrations.go` (`prepareMigrationTasks`) is the ordered registry, and the DB stores which version it's on.

Open one — e.g. `models/migrations/v1_24/v312.go`: a real change (`AddDeleteBranchAfterMergeForAutoMerge`) that adds a column via `x.SyncWithOptions(...)`.

The architectural discipline — the **expand–contract** pattern:

- Add the new shape, tolerate **both** old and new, backfill, switch reads, *then* drop the old shape.
- Because the database tolerates both during the transition, you roll the change out to a **live** system in stages and never force a breaking switch. Shipping the change and switching to it become separate steps — **"deploy ≠ release", applied to data**. (You'll meet "deploy ≠ release" again for *code* if you go on to a DevOps course; here it governs the schema.)
- This is why "just change the column" is fine on a toy app and catastrophic on a running one with 300 deploys of history.

### Part 5 — Workshop: a scenario becomes a data decision (25 min)
In pairs, take one quality-attribute scenario from S7 (e.g. *"the repo home page loads under 300 ms with 50k issues"*). What does it imply for data architecture — where do you index, denormalise, cache, or replicate? Sketch the storage decisions. One pair shares.

### Part 6 — Synthesis (10 min)
The bridge: a normalised model is correct but sometimes slow to read; **S15 (caching) is mostly about hiding slow reads**, and keeping those caches correct is an **event** problem (S16). Bring your "slow as written" notes next week.

---

## Exercise

Take the data model behind your 7–8 API. Half a page:

- For each table, note **who reads it** (often/rarely) and **who writes it** (often/rarely).
- Mark one query that is **slow as written**, and one value you'd consider **denormalising** to speed a read — and what it would cost you on writes.
- Sketch one **migration** you'd need for a plausible new feature, and say whether it's expand–contract-safe.

Bring it to session 15.

---

## Investigation (after class)

Ask your agent, **verify against Gitea's code**, write it up. Pick **two** of the three.

### Prompt 1 — Read a real table
> "In Gitea's `models/issues/issue.go`, describe the `Issue` model: its primary key, its indexes, its foreign keys, and which fields are *not* stored as columns (`xorm:\"-\"`)."

**Verify:** open the struct. For one index, say which query it speeds up. For one `xorm:"-"` field, say what join loads it. Note one thing the agent got right and one it fudged.

### Prompt 2 — Read a real migration
> "Open one file in `models/migrations/` (a recent `vNNN.go`). What schema change does it make? Would applying it break a *running, not-yet-updated* copy of Gitea during a rolling deploy?"

**Verify:** open the file. Is the change additive (expand-contract-safe) or destructive? What would make it unsafe?

### Prompt 3 — Find a denormalisation
> "Find one place where Gitea stores or caches a *derived* value (a count, a status) instead of computing it from a join every time. Why is that read path worth the extra write cost?"

**Verify:** open the file the agent names. Is the value really derived? What write has to keep it correct?

### Deliverable

Half a page:

- **What I investigated** — which two prompts.
- **One claim the agent got right** — and the file/symbol that proves it.
- **One claim that was vague, wrong, or oversold** — and how you checked.
- **One read/write asymmetry** — in your own words: a value that's cheap to read because something paid for it on write.

Bring it to session 15. First 10 minutes we compare.

---

## Optional

- [optional] Kleppmann, M. — *Designing Data-Intensive Applications*, chapters 2 and 5 (data models; replication). The canonical reference.
- [optional] Skim your ORM's docs (or Gitea's `xorm`) on how struct tags map to columns, indexes, and constraints.
