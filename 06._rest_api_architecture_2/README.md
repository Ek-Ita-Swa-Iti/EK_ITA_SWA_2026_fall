# Session 6: REST API Architecture II — Versioning, Errors, OpenAPI

**ITA Software Architecture 2026 Fall | 3 hours**

> Designing the happy path is easy. Designing for change, failure, and discoverability is the rest of the job. Today: how APIs evolve without breaking clients, how to return errors that are useful, and how OpenAPI turns an API into a contract you can hand to a stranger.

---

## Learning Goals

- Pick a versioning strategy and defend it.
- Design error responses that help the client fix the problem.
- Handle pagination, filtering, and sorting cleanly.
- Write a small OpenAPI specification that a generator could build a client SDK from.

---

## Before Class

- Bring the API sketch from session 5.
- Skim the OpenAPI 3.x spec landing page — just enough to know what it looks like.

---

## Today's Teachings

### Part 1 — Versioning (45 min)
Approaches:
- URL versioning (`/v1/articles`) — visible, easy, the de facto standard.
- Header versioning (`Accept: application/vnd.example.v1+json`) — purer, harder.
- No versioning — and the cost of that choice.

Discussion: what counts as a breaking change? (Adding a required field, changing a status code, renaming a field, removing an endpoint.)

### Part 2 — Errors as a designed surface (45 min)
- One consistent error shape, used everywhere.
- The RFC 7807 "Problem Details" model: `type`, `title`, `status`, `detail`, `instance`.
- Validation errors: per-field, machine-readable.
- Don't leak stack traces. Don't return prose only.
- "What can the client *do* with this error?" is the test.

### Part 3 — Collections: pagination, filtering, sorting (45 min)
- Offset/limit vs. cursor-based pagination — trade-offs.
- Filter syntax: query string vs. dedicated DSL.
- Sorting: `?sort=-createdAt`.
- "Don't paginate" as a choice, when appropriate.

### Part 4 — OpenAPI in practice (45 min)
- The shape of an OpenAPI 3 document.
- Live: turn one endpoint from your session-5 sketch into OpenAPI YAML together.
- Tooling: Swagger UI, Redoc, code generators, mocking from spec.
- The contract becomes the artefact. Whoever reads the spec — frontend devs, third parties, future you — gets a single source of truth.

---

## Exercise

Take your session-5 sketch and:
1. Add error responses to every endpoint.
2. Add pagination to any collection endpoints.
3. Write an OpenAPI YAML for at least three endpoints.

This is the spec you'll build from in sessions 7–8.

---

## After Class

- Sessions 7–8 are the mini-project: design and implement a small REST API. Today's exercise is the input.

## References

- *RFC 7807* — Problem Details for HTTP APIs.
- *OpenAPI Specification 3.1*.
- Zalando — *RESTful API Guidelines* (a widely-cited public style guide).
