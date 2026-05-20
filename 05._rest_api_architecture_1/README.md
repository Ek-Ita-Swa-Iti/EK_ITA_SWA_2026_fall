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

## Investigation (after class)

You learned the REST constraints by poking at a real API. Now sharpen what you noticed by interrogating an LLM about it — and verifying.

**Ground rule:** the LLM is a fast, confident, sometimes-wrong study partner. For every claim it makes that matters, verify it against the real API (a `curl` away) or the GitHub docs. The point isn't to collect answers; it's to learn to *check* them.

Pick **three** of the four prompts below. For each:

1. Run the prompt in Claude Code (or another LLM tool — Claude works well because it can also run the verification command for you).
2. Verify the central claim with a real request or a doc lookup.
3. Note one place the LLM was correct, one place it was vague, wrong, or hedged.

### Prompt 1 — Why does GitHub return 404 when 403 would be more honest?
> "When I ask GitHub's API for a private repo I don't have access to, it returns 404 Not Found instead of 403 Forbidden. Why? Is this REST-compliant?"

**Verify:** create a private repo on your own account, then try to fetch it both with and without your token. Then try fetching `/repos/some-real-org/some-real-private-repo`. Compare the status codes and the response bodies.

### Prompt 2 — Star a repo: idempotent or not?
> "Show me the exact HTTP requests to star and unstar a GitHub repo. Which HTTP method does each use, and is the operation idempotent in the REST sense? What status codes should I expect?"

**Verify:** actually star and unstar a repo (use a test repo or one of your own). Run the calls twice in a row each. Does the second call behave the same as the first? Does the status code change? Does the LLM's answer match what you observe?

### Prompt 3 — `If-None-Match` and the rate limit
> "On GitHub's API, if I send a conditional GET with `If-None-Match` and the server responds 304, does that request count against my rate limit? Cite a primary source."

**Verify:** make 5 unauth'd requests to the same endpoint, capture the `X-RateLimit-Remaining` value each time. Then make 5 more using `If-None-Match` with the ETag from the first response. Compare. Read the relevant section of GitHub's rate-limit docs and check whether the LLM's claim matches.

### Prompt 4 — REST cheating
> "GitHub's API returns 405 Method Not Allowed when I try `DELETE /repos/{owner}/{name}/issues/{n}`. Why don't they let me delete issues via the API? Is this a REST violation, and if so, why is it the right call here?"

**Verify:** try the delete (it'll fail safely with 405). Read GitHub's issues API docs. Cross-check the LLM's reasoning against what GitHub actually documents about issue lifecycle.

### Deliverable

A half-page note (markdown is fine — drop it in the repo you're using for the semester). Structure:

- **What I investigated** — which three prompts.
- **One thing the LLM got right** — and how you know.
- **One thing the LLM got wrong, vague, or hedged on** — and how you checked.
- **What changed in my understanding** — one or two sentences.

Bring this to session 6. We'll spend the first 10 minutes comparing notes.

---

## Optional

- [optional] Fielding, R. — *Architectural Styles and the Design of Network-based Software Architectures*, dissertation chapter 5 (2000). The primary source for REST. Dense; the investigation above covers the working knowledge.
- [optional] Tilkov, S. — *REST APIs must be hypertext-driven* (Fielding's blog rant on REST purity).
- [optional] GitHub REST API docs: <https://docs.github.com/en/rest>. Useful when verifying in the investigation kit; also a great browse if you want more.
