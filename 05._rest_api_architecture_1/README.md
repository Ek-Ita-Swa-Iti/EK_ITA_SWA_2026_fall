# Session 5: REST API Architecture I — Constraints, Resources, Methods

**ITA Software Architecture 2026 Fall | 3 hours**

> REST is the dominant style for web APIs, but most "REST APIs" in the wild aren't strictly RESTful — and that's fine. The point isn't purity; it's understanding the constraints REST commits to and what each one buys you. Today we'll learn that by poking at a real one: GitHub's API. Bring `curl` and a Personal Access Token; come ready to break things on purpose.

---

## Learning Goals

- Model a domain as **resources** and read URL shapes critically.
- Use HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) correctly, and explain *why* each behaves the way it does.
- Use status codes (2xx, 3xx, 4xx, 5xx) with intent, not vibes.
- Recognise the REST constraints (uniform interface, statelessness, cacheability, …) in a real API you've just used.

---

## Before Class

You'll spend most of the session hitting a real API directly from the terminal. Set up these in advance:

1. Install `curl` (already on macOS/Linux) **or** `httpie` (`brew install httpie`, friendlier output).
2. Install `jq` for pretty-printing JSON (`brew install jq`).
3. Create a **GitHub Personal Access Token (classic)** with read-only scopes (`public_repo`, `read:user`). Save it in an env var, e.g. `export GH_TOKEN=...`.
4. Sanity check it works:
   ```bash
   curl -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user | jq .login
   ```
   If you see your username, you're set.

If GitHub auth is genuinely blocking you, you can do most of the session unauthed (60 requests/hour). Bring it up early so we can pair you with someone.

---

## Today's Teachings

### Part 1 — Predict, then probe (20 min)
We'll look at a handful of GitHub API URLs *before* hitting them. You predict what each returns. Then we hit them and compare. Bring your terminal.

### Part 2 — Break things on purpose (30 min)
A scavenger hunt for status codes. You'll try requests that *should* fail and inspect what comes back. Goal: collect as many distinct status codes as you can, and figure out which method/path combinations produce them.

Some are easy. Some are sneaky (try to find a `422`).

### Part 3 — Statelessness and caching are part of the protocol (25 min)
Response headers are an API talking about itself. We'll look at `ETag`, `Cache-Control`, and the rate-limit headers — and use conditional requests (`If-None-Match`) to make calls that *don't count against your rate limit*.

### Part 4 — Follow the links (20 min)
Look at a single repository response. Count the `*_url` fields. We'll try to navigate from a user to a specific issue without typing a single URL — only by following links inside responses. Then we'll talk about why almost no real client actually does this.

### Part 5 — API archaeology (45 min, in pairs)
Each pair picks one mystery and writes up a short dossier — what URI shape, what method, what status codes, what surprised you. Examples:

- Star a repo, then unstar it. What methods? What status codes?
- Create an issue, edit it, close it. Document the full lifecycle.
- Find every way GitHub returns `422`.
- Why does `/user` work but `/users` (with no name) doesn't?
- Page through a user's repositories. How does the API tell you there's a next page?

### Part 6 — What we just learned (40 min)
Whiteboard. Every pair calls out what they found. We'll group your observations into the REST constraints (uniform interface, statelessness, cacheability, client-server, layered, code-on-demand). The constraints are names for things you already saw.

---

## Exercise

Sketch a REST API for a small domain you care about (a library, a recipe book, a habit tracker, anything). Just URLs + methods + status codes — no implementation. Bring it to session 6, where we'll do versioning, pagination, and error shapes on top of it.

---

## After Class

- Read Fielding's chapter 5 (or a digestible summary) — it'll land differently now that you have concrete anchors from class.
- Session 6 builds directly on this: versioning, pagination, errors, OpenAPI.
- Sessions 7–8 (mini-project) use sessions 5–6. Take notes seriously.

## References

- Fielding, R. — *Architectural Styles and the Design of Network-based Software Architectures* (dissertation, 2000), chapter 5.
- GitHub REST API docs: <https://docs.github.com/en/rest>
- Tilkov, S. — *REST APIs must be hypertext-driven* (blog post, the famous Fielding rant).
