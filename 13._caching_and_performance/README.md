# Session 13: Caching and Performance

**ITA Software Architecture 2026 Fall | 3 hours**

> "Make it fast" is a quality attribute; "cache it" is the most common way to deliver on it — and one of the most common ways to ship a bug that only appears in production. Today: *where* caches live, *which* strategy fits which read/write pattern, the eternal hard problem of *invalidation* — and a real cache layer inside **Gitea**, where one function signature *is* the cache-aside pattern.

---

## Learning Goals

- Identify the cache levels in a typical web stack and what each is good for.
- Choose a caching strategy that matches a read/write pattern.
- Read a real application cache — port, backends, and one concrete cache-aside use.
- Recognise the failure modes (stampede, staleness, drift) and reason about invalidation.
- Reason about a latency budget — where the time goes and where caching actually helps.

---

## Before Class

- Have **Gitea** (v1.26.2) cloned/browsable — same codebase we met in S11.
- Bring your S12 data-architecture deliverable.
- [optional] Skim a "latency numbers every programmer should know" table — just the orders of magnitude.

---

## Today's Teachings

### Part 0 — Compare notes from S12 (10 min)
Pairs swap S12 deliverables: one data-model decision that held up, one that was shaky. Two pairs share.

### Part 1 — Where caches live (25 min)
A request passes many places a result could be remembered. From the client inward:

- **Browser** (HTTP `Cache-Control` — you saw this on GitHub in S10).
- **CDN** — edge copies of static/semi-static responses.
- **Reverse proxy** (Nginx, Varnish).
- **Application in-memory cache** — inside the process.
- **Distributed cache** (Redis, Memcached) — shared across instances.
- **Database** query cache / materialised views.

Each is the right answer to a *different* problem. Frame it as a **latency budget**: a page has, say, 500 ms; it's spent across DNS, TLS, server work, DB, and render. Caching only helps where the time actually goes — so you measure first.

### Part 2 — Cache strategies (20 min)
- **Cache-aside (lazy):** the app checks the cache; on a miss it reads the source and fills the cache. The default.
- **Write-through:** write to cache and source together (consistent, slower writes).
- **Write-behind:** write to cache, flush to source asynchronously (fast, riskier).
- **Read-through:** the cache fronts the source invisibly.

The choice is a read/write-pattern question, not a taste question.

### Part 3 — Back in Gitea: a real cache (35 min) — the set-piece
Open `modules/cache/cache.go`. The cache-aside strategy isn't described in a comment — it *is* the function signature:

```go
// GetString returns the key value from cache with callback when no key exists in cache
func GetString(key string, getFunc func() (string, error)) (string, error)
```

Read it: *check the cache for `key`; on a miss, call `getFunc()`, store the result, return it.* That's cache-aside in one function. `GetCache()` hands back the configured backend.

The backends are **adapters behind one port** (S9 again): `cache_redis.go` (distributed, shared across instances), `cache_twoqueue.go` (in-memory, with 2Q eviction). Same interface, swap the implementation with config.

Now a concrete use — `services/repository/cache.go`, `CacheRef`:

```go
commitsCount, err := cache.GetInt64(repo.GetCommitsCountCacheKey(...), func() (int64, error) { ... })
```

Computing the number of commits on a branch is a *git operation* — expensive. So Gitea caches it with cache-aside, keyed per repo+ref. Ask your agent: *"What does Gitea cache here, and what's the cost it's avoiding?"* Then open the file and check.

### Part 4 — The hard problem: invalidation (25 min)
> *"There are only two hard things in Computer Science: cache invalidation and naming things."*

- **TTL** (time-based) — simple, often good enough, always a little stale.
- **Event-based** — accurate, but you must catch *every* write that makes the cached value wrong.
- **Stampede / thundering herd** — a popular key expires and a thousand requests recompute it at once. Mitigations: locks, jitter, request coalescing.
- **Stale-forever** — an invalidation you forgot to wire; the cache serves wrong data indefinitely (this is why you monitor).

In Gitea: that cached commit count is wrong the moment someone pushes. *When* and *how* does it get invalidated? That's a **push event** triggering invalidation — a direct bridge to event-driven architecture (S18): **invalidation is an event.**

### Part 5 — Latency-budget workshop (25 min)
In pairs, take a 500 ms budget for one page in your project (or a Gitea page — a repo home view). Distribute the budget across the stages. For each, decide: would a cache help here, and which level? Where would a cache *not* help at all? One pair shares.

### Part 6 — Synthesis (10 min)
The thread to S18: every cache is a bet that the source won't change before the TTL — and keeping a cache correct is fundamentally about **reacting to events** (a write happened; invalidate). Event-driven architecture (S18) is that idea generalised.

---

## Exercise

Take the API + data model from sessions 10–12. Write a caching plan, half a page:

- Which **two** read paths are worth caching, and why (what's expensive)?
- For each: which **level** (app / distributed / DB), which **strategy**, and what **TTL or event** invalidates it?
- Name one place a cache would be the *wrong* answer.

---

## Investigation (after class)

Ask your agent, **verify against Gitea's code**, write it up. Pick **two** of the three.

### Prompt 1 — One port, several caches
> "Compare Gitea's cache backends in `modules/cache/` — `cache_redis` vs `cache_twoqueue`. What does each give you (persistence, eviction, sharing across instances)? When would you pick each?"

**Verify:** open both files. Is the agent's claim about eviction/persistence visible in the code? Which backend would you run on a single node vs a multi-node deployment, and why?

### Prompt 2 — A real cache-aside, end to end
> "In Gitea's `services/repository/cache.go`, what does `CacheRef` cache, on what key, and what expensive work does it avoid on a hit?"

**Verify:** open the file. Trace miss → `getFunc` → store. Then answer: what *write* makes this cached value wrong, and where would invalidation have to happen?

### Prompt 3 — Where the budget goes
> "For a Gitea repository home page, which pieces of data are expensive to produce, and which would you cache? Which are cheap enough that caching would just add risk?"

**Verify:** sanity-check one of the agent's "expensive" claims against the code (is it a git operation? a DB aggregate?). Note one thing it over- or under-rated.

### Deliverable

Half a page:

- **What I investigated** — which two prompts.
- **One claim the agent got right** — and the file/symbol that proves it.
- **One claim that was vague, wrong, or oversold** — and how you checked.
- **One cache and its invalidation** — in your own words: what's cached, and what makes it stale.

Bring it to session 18 (event-driven). First 10 minutes we compare.

---

## Optional

- [optional] "Latency numbers every programmer should know" (Norvig / Dean — many versions online).
- [optional] Kleppmann, M. — *Designing Data-Intensive Applications*, ch. 11 (streams / invalidation as a stream of changes).
