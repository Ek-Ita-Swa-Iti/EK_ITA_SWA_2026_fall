# Session 20: Security Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> Security is a quality attribute (S7), but it earns its own session because the architectural decisions are early and expensive to undo. Today, against a real multi-user system — **Gitea** — we read the two halves of access control: **authentication** as a *port with many adapters* (password, OAuth2, token, …) and **authorization** as an *explicit, ordered permission model*. Plus the OWASP Top 10 at the architecture level, trust boundaries, and handling secrets without leaking them.

---

## Learning Goals

- Distinguish **authentication** and **authorization**, and the common protocols for each.
- Read a real **authentication port and its adapters** — many ways to prove identity behind one interface.
- Read a real **authorization model** — ordered access levels + per-resource permission checks + token scopes.
- Recognise OWASP Top 10 risks at the *architecture* level; plan secret handling; identify trust boundaries.

---

## Before Class

- Have **Gitea** (v1.26.2) cloned/browsable — the same codebase we've read since S11.
- Skim the **OWASP Top 10** (current edition) — just the category names.
- Have you ever stored a password as plain text "for now"? Be ready to confess.

---

## Today's Teachings

### Part 0 — Who's allowed? (10 min)
Every Gitea endpoint we've read since S11 quietly assumed the caller was **authenticated** and **authorized** — we just never looked at who decides. Today we do. In pairs: name one endpoint from an earlier session (a repo read, an issue create) and say who *should* and *shouldn't* be able to call it. Two pairs share.

### Part 1 — AuthN vs AuthZ (25 min)
- **Authentication** — *who are you?* Passwords (hashed with bcrypt/argon2), OAuth2 + OpenID Connect, SSO, API tokens, passkeys.
- **Authorization** — *what are you allowed to do?* Role-based (RBAC), attribute-based (ABAC), policy engines (OPA).
- **JWTs** — what they are (signed claims), what they aren't (not revocable, not private, not a session store).
- The two are constantly conflated. Keep them apart all session.

### Part 2 — Back in Gitea: authentication as a port with many adapters (30 min) — the set-piece
Open `services/auth/interface.go`: the `Method` interface (`Verify(request) (*User, error)` + `Name()`) **is the authentication port**. Many adapters implement it, each trusting a different *proof of identity*:

- `basic.go` (HTTP Basic), `oauth2.go` (OAuth2 / OIDC), `auth_token.go` (API tokens), `httpsign.go` (signed HTTP requests), `reverseproxy.go`, `session.go` (cookie session), `sspi.go` (Windows SSPI).

Gitea tries the methods in order until one verifies. **This is ports-and-adapters again (S9)** — the same shape as the LLM backends (S9), the cache (S13), and the queue (S18): one interface, swappable implementations, *adding an auth method is adding a file*. Ask your agent: *"List the auth `Method`s in `services/auth/`. For each, what does `Verify()` accept as proof of identity?"* Then open two and check.

### Part 3 — Back in Gitea: authorization as an explicit model (30 min) — set-piece 2
Authorization here isn't scattered `if user.IsAdmin` checks — it's a model:

- `models/perm/access_mode.go` — `AccessMode`: an **ordered** level, `None(0) < Read(1) < Write(2) < Admin(3) < Owner(4)`. `AccessModeNone` is the zero value — **default-deny** by construction.
- `models/perm/access/repo_permission.go` — the `Permission` struct and how a user's effective access to a repo is computed (owner? team membership? public repo?).
- `models/auth/access_token_scope.go` — `AccessTokenScope` narrows it *further*: a token can be granted, say, read-only repo access even if the user has more. Defence in depth.

The architectural point: authorization is **centralised and explicit**, so "who can do what" is one model you can audit, not a hunt through handlers.

### Part 4 — Trust boundaries + OWASP at the architecture level (25 min)
A **trust boundary** is where assumptions about the other side change. In Gitea: the API surface (untrusted input arrives), the auth check (anonymous → identified), the permission check (identified → authorized). Validate at each; trust nothing from the wrong side. Then walk the OWASP Top 10 as *architecture* vs *code*:

- **Broken access control** → centralise authz, default-deny (Gitea's `AccessMode`).
- **Cryptographic failures** → use libraries, never roll your own.
- **Injection** → parameterise; treat input as untrusted at the boundary.
- **Security misconfiguration** → infrastructure-as-code (a DevOps-course thread).
- **SSRF** → egress allowlists.
- **Defence in depth** — layered controls, like user permission *and* token scope both having to allow an action.

### Part 5 — Secrets (20 min)
- Where secrets must **not** live: source code, log files, error messages, frontend bundles.
- Where they can: environment variables (with care), secrets managers (Vault, AWS Secrets Manager, 1Password CLI).
- Rotation: how often, who triggers it, what breaks. The "leaked API key in a public repo" incident.

### Part 6 — Threat modelling lite + synthesis (10 min)
STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) as a quick checklist on any architecture diagram. Synthesis: every system we've read has trust boundaries — now we can name and place them. S21 records these decisions as ADRs.

---

## Exercise

Take the project from sessions 14–17. Half a page:

- Identify **three trust boundaries** and **one threat** at each.
- For one of them, decide: would you model authorization as an **ordered `AccessMode`** (like Gitea) or as named **roles** — and why?

Bring it to session 21.

---

## Investigation (after class)

Ask your agent, **verify against Gitea's code**, write it up. Pick **two** of the three.

### Prompt 1 — One port, many auth methods
> "List the authentication `Method`s in Gitea's `services/auth/`. For each, what does `Verify()` accept as proof of identity (a password? a token? a session cookie?)?"

**Verify:** open `interface.go` and two adapters. Which method would you *disable* in a hardened, API-only deployment, and why?

### Prompt 2 — Read the permission model
> "In Gitea, how is a user's access to a private repository decided? Walk from `models/perm/access_mode.go` (`AccessMode`) through `models/perm/access/repo_permission.go`."

**Verify:** open the files. Where is the **default-deny**? Name one path that grants more than `Read`.

### Prompt 3 — Token scopes as defence in depth
> "In `models/auth/access_token_scope.go`, how does a scoped API token narrow what an authenticated user can do? Why is that defence in depth rather than redundant with the user's permissions?"

**Verify:** open the file. Give one example where the user is allowed but the *token* is not.

### Deliverable

Half a page:

- **What I investigated** — which two prompts.
- **One claim the agent got right** — and the file/symbol that proves it.
- **One claim that was vague, wrong, or oversold** — and how you checked.
- **One trust boundary** — in your own words: where assumptions change, and what must be checked there.

Bring it to session 21. First 10 minutes we compare.

---

## Optional

- [optional] *OWASP Top 10* (current edition) — the category names are the useful part.
- [optional] Shostack, A. — *Threat Modeling: Designing for Security* — the STRIDE reference.
- [optional] Read Gitea's `services/auth/` (the `Method` port + adapters) or `models/perm/` (the access model) with your agent — the cleanest real authN/authZ pair you'll see this semester.
