# CLAUDE.md — Software Architecture, ITA Fall 2026

This file gives you context for working in this repository as a teaching assistant.

---

## About the Course

This course teaches **software architecture** to ITA students at KEA (Copenhagen School of Design and Technology). The course runs in autumn 2026, with approximately **30 sessions of 3 hours each**.

Rather than treating architecture as diagrams to be drawn, the course teaches it as **decisions, boundaries, and conventions** — the rules a system commits to so that it can grow without collapsing under its own weight. Students will read real systems, design small ones of their own, and learn to defend their choices.

## Exam

The exam is project-based. The final 8 sessions of the semester are reserved for exam project work — students design and partially implement an architecture for a system of their choice and present/defend it at the exam.

---

## What this repo is

This is the **teacher's repository** for the **ITA Software Architecture** course, autumn 2026, at KEA.

The repository is a mix of student-facing session material (one folder per session) and teacher-facing notes. AI tools (Claude Code, ChatGPT, etc.) are used to draft, refine, and lint the curriculum.

---

## Repository structure

```
/
├── CLAUDE.md                                      # This file
├── README.md                                      # Public-facing course overview
├── 01._intro_to_software_architecture/            # Teaching session
├── 02._quality_attributes/                        # Teaching session
├── ...                                            # 16 teaching sessions total
│
├── 07._mini_project_rest_api/                     # Project session (no teaching)
├── 08._mini_project_rest_api/                     # Project session (no teaching)
├── 13.–16._project_distributed_system/            # 4-session project block
├── 23.–30._exam_project/                          # 8-session exam project block
```

Each session is its own folder. Teaching sessions contain a `README.md` with learning goals, before-class reading, today's teachings, an in-class exercise, and after-class follow-up. Project/exam-session folders are intentionally empty until the project briefs are written.

---

## Session breakdown

**30 sessions total**, 3 hours each. The composition:

| Sessions | Count | Type |
|----------|------:|------|
| 1–6, 9–12, 17–22 | **16** | Teaching sessions (drafted) |
| 7–8 | **2** | Mini-project on REST API design (empty for now) |
| 13–16 | **4** | Mid-semester project: small distributed system (empty for now) |
| 23–30 | **8** | Exam project block (empty for now) |

Project and exam sessions have **no new teaching content**. They are working sessions — students apply what they've learned, get feedback, and prepare deliverables.

---

## Curriculum overview

| # | Topic | What students do |
|:-:|-------|-----------------|
| 1 | **Intro to software architecture** | Discuss "where is the architecture?" using real and toy systems. Set up notebook/repo for the semester. |
| 2 | **Quality attributes** | Map non-functional requirements (performance, scalability, security, maintainability) onto a system they know. |
| 3 | **Layered architecture** | Identify layers in a real codebase. Discuss when separation helps and when it hurts. |
| 4 | **Hexagonal architecture (ports and adapters)** | Refactor a small example. Discuss testability and replaceability. |
| 5 | **REST API architecture I** | REST constraints, resources, methods, status codes. Read and critique a real API. |
| 6 | **REST API architecture II** | Versioning, pagination, error shapes, OpenAPI. Design an API on paper. |
| **7–8** | **Mini-project: design a REST API** | *No teaching. Students build on sessions 5–6.* |
| 9 | **Data architecture** | SQL vs document stores, schemas, migrations, read/write patterns. |
| 10 | **Caching and performance** | Where to cache, what to cache, invalidation. Reading latency budgets. |
| 11 | **Event-driven architecture** | Queues, pub/sub, async messaging. When and why. |
| 12 | **Microservices vs monoliths** | The trade-off honestly. Coupling, deployment, ops cost. |
| **13–16** | **Project: small distributed system** | *No teaching. Students apply sessions 9–12.* |
| 17 | **Security architecture** | Authentication vs authorization, OWASP Top 10, secrets handling. |
| 18 | **Observability** | Logs, metrics, traces. What "observable" actually means in practice. |
| 19 | **CI/CD and deployment** | Pipelines, environments, infrastructure-as-code, blue/green & canary. |
| 20 | **Documentation: ADRs and the C4 model** | How to record decisions and draw the right diagrams. |
| 21 | **Case study: the self-maintaining wiki** | Read `21._self_maintaining_wiki_case_study/architecture-class-handout.md`. Build a tiny LLM-maintained wiki in pairs. |
| 22 | **Synthesis: real-world architectures** | Reading two real architectures (e.g. Stack Overflow, GitHub) and discussing trade-offs. |
| **23–30** | **Exam project** | *No teaching. Students design, build a slice, and present.* |

---

## House rules for course material

- **One folder per session.** Even if two sessions form one project, keep them as separate folders so the time structure is visible.
- **Teaching-session README.md** follows a consistent shape: title + week/time line + one-blockquote summary, then `## Learning Goals`, `## Before Class`, `## Today's Teachings`, `## Exercise`, `## After Class`. Optional: `## References`.
- **Project/exam-session folders** can stay empty until the project brief is written. Don't fabricate content for these.
- **REST API is a load-bearing thread.** Sessions 5 and 6 must be solid because the mini-project depends on them and the exam projects routinely involve API design.
- **Keep examples concrete.** Architecture students disengage when sessions are abstract. Whenever possible, anchor a concept to a system they can open and look at.
- **Language**: course material can be in **English or Danish** — follow whatever the existing file uses, or ask if unclear.
- **Optional readings/resources.** When a session links to material that is not required, place it under a `## Optional` heading (not `## References` or `## Further reading`) and mark each item with a leading `[optional]` tag. The expectation is that students engage with hands-on activities and investigation prompts first; canonical sources stay discoverable but never gate the session.

---

## How to help the teacher

Typical tasks when asked to help in this repo:

- **Fleshing out a session README** — write the in-class outline, suggest exercises, draft the pre-reading list.
- **Suggesting concrete code/system examples** that illustrate a given concept (real systems > toy examples).
- **Writing the project briefs** for sessions 7–8, 13–16, and 23–30 once the teacher is ready.
- **Linting the curriculum** — find concepts referenced but never introduced; find prereq breaks if sessions are reordered.
- **Drafting hand-outs** for in-class reading (the `21._self_maintaining_wiki_case_study/architecture-class-handout.md` is the template).

---

## Tone and audience

- **Teacher audience**: direct, concise, practical. Doesn't need hand-holding.
- **Student audience**: ITA students with prior programming experience but typically no formal architecture training. Don't assume they've seen "layered architecture" or "CAP theorem" — define terms when introduced.
- **Be honest about trade-offs.** Architecture is full of "it depends." Material that pretends there's one right answer ages badly.

---

## Pending decisions

*(empty for now — record open curriculum questions here as they come up)*
