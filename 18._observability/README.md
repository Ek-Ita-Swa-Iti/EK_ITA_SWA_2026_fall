# Session 18: Observability

**ITA Software Architecture 2026 Fall | 3 hours**

> A system is "observable" when you can answer questions about its behaviour from the outside without shipping new code. That's a higher bar than "we have logs." Today: the three pillars (logs, metrics, traces), what each is for, and how to instrument a system so production debugging takes minutes instead of days.

---

## Learning Goals

- Distinguish logs, metrics, and traces — what each is good and bad at.
- Recognise the difference between **monitoring** (alerts on known failures) and **observability** (debugging unknown failures).
- Add structured logging to a service.
- Read a trace and explain what happened.

---

## Before Class

- Find one production outage post-mortem online (Cloudflare, GitHub, AWS, Stripe — they publish detailed ones). Read it. Note: how did they figure out what happened?

---

## Today's Teachings

### Part 1 — Monitoring vs. observability (30 min)
- Monitoring: "is the thing up?" "is the error rate above threshold?" — known questions.
- Observability: "why is *this particular request* slow?" — questions you didn't anticipate.
- Most teams have monitoring and call it observability. The difference matters at 3am.

### Part 2 — The three pillars (60 min)
- **Logs**: events, with structure. Searchable. Expensive in volume. Use them for "what happened in this request."
- **Metrics**: numeric, time-series, aggregated. Cheap. Use them for "how is the system trending."
- **Traces**: a request's path through services, with timing. Use them for "where did the latency go."
Plus a fourth pillar people sometimes add: **events** (deploys, config changes, feature flags flipping).

### Part 3 — Structured logging (30 min)
- Plain-text logs vs. structured (JSON) logs.
- Correlation IDs: every log line knows which request it belongs to.
- What to log, what not to log (PII, secrets, request bodies).
- The "log level discipline" problem: most teams have nine `INFO` lines per request and none of them help.

### Part 4 — Distributed tracing (30 min)
- Spans, traces, parents, tags.
- OpenTelemetry as the de facto standard.
- A worked example: a trace through three services, one is slow — find the bottleneck in 30 seconds.

### Part 5 — Workshop (30 min)
Take the post-mortem you read. Map what the engineers needed to investigate to: logs, metrics, or traces. Were they working with the right tool? Where did they get lucky?

---

## Exercise

Take the project from sessions 13–16. Specify: which logs you'd want for one critical endpoint, which two metrics you'd dashboard, and what you'd need in a trace if a user reported it was slow.

---

## After Class

- Session 19 covers CI/CD — and "observability of the pipeline" is real too. Bring today's thinking.

## References

- Charity Majors et al. — *Observability Engineering* (O'Reilly).
- *OpenTelemetry* documentation.
- *Google SRE Book* — chapter on monitoring distributed systems.
