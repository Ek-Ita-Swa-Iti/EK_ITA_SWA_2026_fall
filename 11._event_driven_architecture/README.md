# Session 11: Event-Driven Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> Instead of "service A calls service B and waits," service A *announces* that something happened, and any service that cares can react. This shift — from request/response to events and messages — is one of the most consequential architectural choices a team makes. It buys decoupling and resilience; it costs operational complexity and traceability.

---

## Learning Goals

- Distinguish between request/response, message queue, and pub/sub.
- Recognise which problems get easier and which get harder when you go event-driven.
- Identify common patterns: outbox, event sourcing, CQRS — at a high level.
- Make an informed choice between sync and async for a specific use case.

---

## Before Class

- Find one feature in a real system you've used that you suspect is async (a confirmation email, an export, a notification). Bring your guess.

---

## Today's Teachings

### Part 1 — The shift in mindset (45 min)
- Request/response: A calls B, A waits.
- Event-driven: A emits an event, the world reacts.
- Why this matters: A doesn't need to know B exists. B can fail without crashing A.
- The cost: where did my call stack go?

### Part 2 — Messaging primitives (45 min)
- **Message queue** (RabbitMQ, SQS): one producer, one (or one of N) consumer.
- **Pub/sub** (Kafka, SNS, Redis streams): one producer, many consumers.
- **At-least-once vs. exactly-once delivery** — what each really means.
- **Ordering guarantees** — partition-scoped, not global.
- **Dead-letter queues** — what they are and why you need one.

### Part 3 — Patterns at a glance (45 min)
- **Outbox pattern** — the only safe way to "save to DB and publish an event" atomically.
- **Event sourcing** — store the events, derive state from replay.
- **CQRS** — separate the read model from the write model.
We touch each at the conceptual level; deep dives are for another course.

### Part 4 — Sync or async? Workshop (45 min)
For each scenario, decide: sync, async, or hybrid? Defend the choice.
- User registration.
- Posting a tweet.
- Charging a credit card.
- Sending the welcome email after registration.
- Generating a monthly report.

---

## Exercise

Pick one feature from your session-5/6 API design that would be better as async. Sketch the event flow: who emits, who consumes, what happens on failure. Half a page.

---

## After Class

- Sessions 13–16 (project) will likely involve at least one async path. Bring today's notes.

## References

- Stopford, B. — *Designing Event-Driven Systems* (free O'Reilly book from Confluent).
- Fowler, M. — *What do you mean by "Event-Driven"?*
