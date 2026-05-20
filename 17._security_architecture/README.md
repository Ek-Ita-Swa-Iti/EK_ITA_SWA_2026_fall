# Session 17: Security Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> Security is a quality attribute (session 2), but it's worth a session of its own because the architectural decisions are early and expensive to undo. Today: the difference between authentication and authorization, the OWASP Top 10 at the architecture level, and how to handle secrets without leaking them.

---

## Learning Goals

- Distinguish authentication, authorization, and the common protocols for each.
- Recognise the architectural shape of OWASP Top 10 risks (not just code-level fixes).
- Plan secret handling: where keys live, who can read them, how they rotate.
- Read an architecture and identify its trust boundaries.

---

## Before Class

- Skim the OWASP Top 10 (current edition) — just the names of the categories.
- Have you ever stored a password as plain text "for now"? Be ready to confess.

---

## Today's Teachings

### Part 1 — AuthN vs. AuthZ (45 min)
- Authentication: who are you?
- Authorization: what are you allowed to do?
- Common AuthN: passwords (with hashing — bcrypt/argon2), OAuth2, OpenID Connect, SSO.
- Common AuthZ: role-based (RBAC), attribute-based (ABAC), policy engines (OPA).
- JWTs: what they are, what they aren't, when not to use them.

### Part 2 — Trust boundaries (45 min)
- A trust boundary is where one set of assumptions ends and another begins.
- Examples: user-supplied input arriving at your API, your API talking to a third party, your service reading from a queue.
- The architectural job: identify them, validate at them, and don't trust anything from the wrong side.
- Defence in depth.

### Part 3 — The OWASP Top 10 at the architecture level (45 min)
Walk through the current Top 10. For each, what's the *architectural* fix vs. the *code-level* fix?
- Broken access control → centralise authz, default-deny.
- Cryptographic failures → use libraries, never roll your own.
- Injection → parameterise everything, treat input as untrusted at the boundary.
- Security misconfiguration → infrastructure-as-code (preview of session 19).
- SSRF → egress allowlists.
- ... (continue through the list).

### Part 4 — Secrets (30 min)
- Where secrets must *not* live: source code, log files, error messages, frontend bundles.
- Where they can live: environment variables (with care), secrets managers (Vault, AWS Secrets Manager, 1Password CLI).
- Rotation: how often, who triggers it, what breaks.
- The "leaked API key in a public repo" incident response.

### Part 5 — Threat modelling lite (15 min)
The STRIDE acronym (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) as a quick checklist on any architecture diagram.

---

## Exercise

Take the project from sessions 13–16. Identify three trust boundaries and one threat at each. Half a page.

---

## After Class

- Session 18 (observability) is partly about catching security incidents in flight. Today's threat list will help.

## References

- *OWASP Top 10* (current edition).
- Shostack, A. — *Threat Modeling: Designing for Security*.
