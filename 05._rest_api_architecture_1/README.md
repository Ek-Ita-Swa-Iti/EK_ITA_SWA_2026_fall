# Session 5: REST API Architecture I — Constraints, Resources, Methods

**ITA Software Architecture 2026 Fall | 3 hours**

> REST is the dominant style for web APIs, but most "REST APIs" in the wild aren't strictly RESTful — and that's fine. The point isn't purity; it's understanding the constraints REST commits to and what each one buys you. Today we cover the foundations. Next session covers versioning, errors, and pagination.

---

## Learning Goals

- Recite the REST constraints and what each one is *for*.
- Model a domain as **resources** and decide on URL shapes.
- Use HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) correctly.
- Use status codes (2xx, 3xx, 4xx, 5xx) with intent, not vibes.

---

## Before Class

- Pick a public REST API you can browse the docs of (GitHub, Stripe, Twilio, Spotify Web API — any of them).
- Find one endpoint that surprises you. Bring it to class.

---

## Today's Teachings

### Part 1 — The constraints (45 min)
Fielding's six REST constraints:
1. Client–server.
2. Stateless.
3. Cacheable.
4. Uniform interface.
5. Layered system.
6. Code on demand (optional).

For each: what does it actually buy you? Where do real APIs cheat?

### Part 2 — Modelling as resources (45 min)
- **Resource** = a noun the client cares about.
- URLs are nouns; HTTP methods are verbs.
- Common patterns:
  - `/articles` (collection), `/articles/{id}` (item).
  - Nested: `/articles/{id}/comments` — when, and when not.
  - The "verb in the URL" smell (`/getArticleById?id=42`) — why it's a smell, and the rare cases where it's the right answer.

### Part 3 — HTTP methods, properly (30 min)
- `GET` — safe, cacheable, idempotent.
- `POST` — non-idempotent; creates or invokes.
- `PUT` — idempotent replacement.
- `PATCH` — partial update.
- `DELETE` — idempotent removal.
- Why `idempotency` matters more than students usually realise (retries, network failures).

### Part 4 — Status codes with intent (30 min)
Beyond `200` and `500`:
- `201 Created` vs `204 No Content`.
- `400 Bad Request` vs `422 Unprocessable Entity`.
- `401 Unauthorized` vs `403 Forbidden`.
- `409 Conflict`, `429 Too Many Requests`, `503 Service Unavailable`.
- Why "always return 200 with an error in the body" is a real (terrible) anti-pattern.

### Part 5 — Critique a real API (30 min)
In pairs: take the API from your before-class homework. Identify three good design choices and two questionable ones.

---

## Exercise

Sketch a REST API for a small domain (e.g. a library, a recipe book, a todo app). Just URLs + methods + status codes — no implementation. Bring it to session 6.

---

## After Class

- Session 6 builds on this: versioning, pagination, errors, OpenAPI.
- Sessions 7–8 (mini-project) use sessions 5–6. Take notes seriously.

## References

- Fielding, R. — *Architectural Styles and the Design of Network-based Software Architectures* (dissertation, 2000).
- Tilkov, S. — *REST APIs must be hypertext-driven* (blog post, the famous Fielding rant).
