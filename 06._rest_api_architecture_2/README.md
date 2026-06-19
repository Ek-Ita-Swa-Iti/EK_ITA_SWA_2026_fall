# Session 6: API Contracts and OpenAPI

**ITA Software Architecture 2026 Fall | 3 hours**

> An API is a boundary; the **contract** is what crosses it. Last week you probed GitHub's API from the *outside*, as a client. Today we open the *source* of a system that serves the same kind of API — **Gitea** — and read its contract: an OpenAPI spec that is **generated from the code itself**, so it can't quietly drift. Then we fold in the two things a half-contract always forgets: **failure** (errors) and **change** (versioning).

---

## Learning Goals

- Explain why an API's contract is an **architectural artefact**, not documentation.
- Read an OpenAPI spec and map it back to the code that produces it.
- Tell a contract that is **generated-and-checked** from one maintained by hand — and say why drift is the enemy.
- Identify what a usable contract must cover beyond the happy path: **errors** and **versioning/evolution**.
- Treat the contract as the single source of truth that clients, servers, docs, and tooling all depend on.

---

## Before Class

- Meet our second codebase: **Gitea** — `https://github.com/go-gitea/gitea` (we read it pinned at **v1.26.2**). It's a self-hosted GitHub you can read the source of — the server-side counterpart to last week's view from outside. Browse it on GitHub or clone it shallow: `git clone --depth 1 --branch v1.26.2 https://github.com/go-gitea/gitea.git`. Today we both *read* it and *run* it.
- You've had Docker since S3 — make sure it's running, and pre-pull the image so class isn't waiting on a download: `docker pull gitea/gitea:1.26.2`.
- Bring your API sketch / notes from session 5.
- [optional] Skim the OpenAPI 3.x landing page — just enough to know what a spec document looks like.

---

## Today's Teachings

### Part 0 — Compare notes from S5 (10 min)
Pairs swap S5 investigation deliverables: one thing GitHub's API did well, one quirk. Two pairs share. Routine.

### Part 1 — From "an API" to "a contract" (20 min)
An API is a **boundary** (S1). The **contract** is everything that has to be agreed for two sides to talk without prior arrangement: the path, the method, the request shape, the response shape — *and* what happens when it fails.

Where does that contract *live*?

- **In people's heads / a stale README** — the default, and it drifts the moment someone changes the code.
- **As an explicit, machine-readable artefact** — one that clients, servers, docs, tests and code generators can all read.

This is the same idea as S4's ports and adapters, applied to HTTP: **the interface *is* the contract.** **OpenAPI** is how you write that interface down for a web API. The architectural question for today isn't "what fields go in the JSON" — it's *"can the contract be a real, checkable artefact instead of tribal knowledge?"*

### Part 2 — Meet Gitea, read its contract (25 min)
Gitea is our anchor for the server-side half of the course — a real, multi-user, data-backed system (last week we looked at GitHub from the *outside*; this week we read a similar system from the *inside*).

Two things to open:

1. **The contract.** Gitea publishes an OpenAPI spec — the generated document `templates/swagger/v1_json.tmpl` (a running instance serves it at `/api/swagger`). It's large, real, and machine-readable: every endpoint, every parameter, every response.
2. **Where it comes from.** Open a handler — e.g. `routers/api/v1/repo/issue.go` — and find the comment above the list-issues function:
   ```go
   // swagger:operation GET /repos/{owner}/{repo}/issues issue issueListIssues
   ```
   **The contract lives next to the code that implements it.** There are ~470 of these annotations across `routers/api/v1/`; the shared request/response shapes live in `routers/api/v1/swagger/`.

Ask your agent: *"Where does Gitea's OpenAPI spec come from, and how is it kept in sync with the code?"* Then verify against the files above — don't take its word for it.

### Part 3 — Run it: the contract, alive (30 min)
Reading a contract is one thing; watching it answer is another. We'll stand up a throwaway Gitea in Docker — the same version we've been reading — and connect the running system back to the code.

You've used `docker compose` since S3. Put this `docker-compose.yml` in an empty folder:

```yaml
services:
  server:
    image: gitea/gitea:1.26.2     # same version as the source we're reading
    ports:
      - "3000:3000"
    volumes:
      - gitea-data:/data
volumes:
  gitea-data:
```

Then `docker compose up`, open <http://localhost:3000>, accept the SQLite defaults on the install page, and create an admin user. This is a **read-only sandbox** — we keep none of it; `docker compose down -v` deletes the whole thing at the end.

Now connect three views of the *same* contract:

1. **The rendered contract.** Open <http://localhost:3000/api/swagger> — Gitea's live Swagger UI. This is the spec from `templates/swagger/` we just read in code, now browsable: every endpoint, parameter, and response.
2. **A real call.** No login needed for the public bits:
   ```bash
   curl http://localhost:3000/api/v1/version
   ```
   That endpoint is `getVersion` in `routers/api/v1/misc/version.go` — find its `// swagger:operation GET /version ...` comment. **The annotation, the Swagger UI entry, and the live JSON are three views of one contract.**
3. **An error, live.** Ask for something that isn't there:
   ```bash
   curl -i http://localhost:3000/api/v1/repos/nobody/nothing
   ```
   Watch the status line and the error body. We track that exact response shape back to the contract in Part 5.

For the rest of today, when we talk about the code you can *hit the thing* and watch it behave exactly as the contract says.

### Part 4 — Generated, not hand-written: drift is the enemy (20 min)
Here's the architectural punchline. Open the `Makefile`:

- `make generate-swagger` — *"generate the swagger spec from code comments."* The spec is **derived from the annotations**, not typed by hand.
- `make swagger-check` — **fails if the committed spec doesn't match the code.** Gitea runs this in CI, so a pull request that changes an endpoint but forgets to regenerate the spec **doesn't merge**.

So the contract **cannot silently drift** from the implementation — the build enforces it. Contrast a contract that lives in a wiki page: it's correct exactly until the first person changes the code and forgets to update the doc.

This is a convention (S1) made load-bearing by *tooling*, and it's the answer to the documentation problem we'll name again in S20: **the docs that survive are the ones generated and checked, not the ones maintained by goodwill.**

### Part 5 — What a contract must cover: failure and change (25 min)
A happy-path-only contract is half a contract. Two things it must include:

**Failure — errors are part of the contract.** Remember the live 404 you got in Part 3? Open the `responses:` block of one of those `swagger:operation` annotations. The error responses (not-found, forbidden, validation) are declared right there, alongside the `200`. The shared shapes live in `routers/api/v1/swagger/`. The test for a good error: *can the client do something with it?* (The RFC 7807 "Problem Details" model — `type`, `title`, `status`, `detail` — is the common shape; the point is consistency and machine-readability, not prose.)

**Change — the contract has a version, and it evolves.** The `/api/v1/` in every Gitea path *is* the contract's version. So:

- What counts as a **breaking change**? (Remove a field, rename one, change a status code, make an optional field required.)
- How do you evolve *without* breaking existing clients? **Add, don't remove; deprecate, then drop** — the same **expand–contract** discipline we met for databases in S9 ("deploy ≠ release"), now applied to an API contract.

*(Collections need a paging convention too — you saw GitHub's `page`/`per_page` last week — and it belongs in the contract. We won't dwell on it.)*

### Part 6 — The contract as the hub (15 min)
Once the contract is an artefact, look at everyone who depends on it:

- **Swagger UI / Redoc** render it into browsable docs (you opened Gitea's live at `/api/swagger` in Part 3).
- **Code generators** build client SDKs from it.
- **Mock servers** serve a fake API from the spec before the real one exists.
- **Contract tests** check that *both* the server and the client still honour it.

One artefact, many consumers — a **boundary that several parties depend on without coordinating** (S1 contract; forward to S12, where independent services talk only through contracts, and S20, where this is how documentation stays true).

GitHub publishes its own OpenAPI description too. Same kind of API as Gitea, two real contracts, slightly different choices — a useful thing to put side by side.

### Part 7 — Synthesis (10 min)
One pair shares one place Gitea's spec told them something the code alone didn't. The bridge: **a good contract is what lets parts evolve independently** — the precondition for everything in the systems half. Sessions 7–8 (the mini-project) start from a spec *you* write.

---

## Exercise

Take your session-5 API sketch. Produce an OpenAPI document (YAML) for **three endpoints**, and make it a *whole* contract:

1. Each endpoint declares at least **one error response**, not just the happy path.
2. The **version** is in the path.
3. Pick one realistic change you might make to this API later, classify it **breaking or non-breaking**, and write one sentence on how you'd ship it without breaking existing clients.

This is the spec you build from in sessions 7–8.

---

## Investigation (after class)

Same pattern: ask your agent, **verify against Gitea's code**, write it up. Pick **two** of the three.

### Prompt 1 — The contract comes from the code
> "In Gitea, find the `// swagger:operation` annotation for listing a repo's issues (`routers/api/v1/repo/issue.go`). Map it to the matching entry in the generated spec. What do `make generate-swagger` and `make swagger-check` do?"

**Verify:** open the handler and the `Makefile`. Does the spec really come from the annotation? What stops the spec and the code from drifting apart? Note one claim the agent got right and one it fudged.

### Prompt 2 — Errors are part of the contract
> "Pick one Gitea API endpoint. List every response it can return, including errors. Where are the error shapes defined?"

**Verify:** open the endpoint's `responses:` block and look in `routers/api/v1/swagger/`. Are errors first-class in the contract, or an afterthought? Find one error response and say what a client could *do* with it.

### Prompt 3 — Two contracts, compared
> "Compare how Gitea and GitHub model the *same* resource in their public OpenAPI specs — pick `issue` or `repository`. Where do the two contracts agree, and where did they choose differently?"

**Verify:** open Gitea's spec for that resource; find GitHub's published OpenAPI for the equivalent. Name one field or response where they diverge, and which choice you'd defend.

### Deliverable

Half a page in your semester notebook:

- **What I investigated** — which two prompts.
- **One claim the agent got right** — and the file/symbol that proves it.
- **One claim that was vague, wrong, or oversold** — and how you checked.
- **One thing a contract must include beyond the happy path** — in your own words, and why.

Bring it to session 7. The mini-project starts from a spec.

---

## Optional

- [optional] *RFC 7807* — Problem Details for HTTP APIs. The common error shape.
- [optional] *OpenAPI Specification 3.1*. Skim the document structure, not the whole thing.
- [optional] Zalando — *RESTful API Guidelines*. A widely-cited public style guide; skim the versioning and error sections.
