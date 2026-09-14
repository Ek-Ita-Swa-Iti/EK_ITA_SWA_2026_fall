# Session 6: Intro to Software Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> What is software architecture, really? Not the diagrams — the underlying thing the diagrams are trying to show. Today you point the agent you set up in Session 1 at a real codebase you've never seen, and learn to see the architecture in it. The codebase is `mistral-vibe-ek-ita`. The tool is Mistral Vibe itself. You don't need to know Python.

---

## Learning Goals

- Answer "where is the architecture in this system?" with something more useful than "the diagram."
- Recognise architecture as **decisions, boundaries, and conventions**.
- Distinguish architecture from implementation choices that look architectural but aren't.
- Build vocabulary for the rest of the semester: *component*, *boundary*, *contract*, *convention*.
- Use a coding agent (Mistral Vibe) to investigate an unfamiliar codebase — and verify what it tells you.

---

## Before Class

- Bring a laptop with `git` installed and a terminal you're comfortable with.
- Confirm **Mistral Vibe still works** — open a terminal and run `vibe` (installed back in Session 1). If it launches, you're set; if not, fix it *before* class, not during.
- Confirm **Docker still works** (from Session 5) — `docker ps` should run without error.
- Bring a system **you** have built or worked on (any language, any size). Be ready to describe it in 2 minutes.
- [optional] Think for one minute about what "architecture" means to you in software. One sentence. Bring it.

---

## Today's Teachings

### Part 0 — Warm-up: MySQL, but containerised (15 min)
A quick Docker callback before today's main topic. You already know MySQL — probably
through MySQL Workbench. Today you run the exact same database, but **in a container**
instead of installed on your machine, and connect to it from a **VS Code extension**
instead of a separate app.

**Run MySQL in a container** ([Docker Hub: `mysql`](https://hub.docker.com/_/mysql)):
```bash
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -p 3306:3306 -d mysql:8.0
```
The `-p 3306:3306` is what makes this reachable from *outside* the container — same port
mapping idea from Session 5, now put to use with a database instead of a web server.
Confirm it's up: `docker ps`.

**Connect from VS Code** instead of MySQL Workbench: install the **Database Client**
extension ([database-client.com](https://database-client.com)) — search "Database Client"
in the VS Code marketplace — then add a MySQL connection with the same details you'd type
into Workbench:

- Host: `localhost` (or `127.0.0.1`)
- Port: `3306`
- User: `root`
- Password: `my-secret-pw`

Run `SHOW DATABASES;` to confirm the connection works.

The point: same MySQL, same SQL, same credentials — just running **isolated in a
container** and reached through a **different client**. Nothing about the database itself
changed; where and how it runs did. Keep that distinction in mind — it's the same kind of
question today's session asks about *architecture*: which parts of a system are load-bearing,
and which are just the tool you happened to use to reach it?

### Part 1 — Three definitions, side by side (20 min)
Three useful framings of architecture, all true, all slightly different:

- "Architecture is the parts that are hardest to change."
- "Architecture is the decisions you wish you'd made earlier."
- "Architecture is whatever the next developer needs to know."

Map each onto your bring-your-own system. Which fits best? Why? The three frames feel different but they're compatible — we won't pick a winner.

### Part 2 — Meet the codebase (10 min)
You installed Mistral Vibe back in Session 1 — today you point it at something real. You point it at its own source code.

**A. Clone the repo (the thing we study).**

```bash
git clone https://github.com/Ek-Ita-Swa-Iti/mistral-vibe-ek-ita.git
```

You'll come back to this every week. Don't delete it.

**B. Point Vibe at it.** Launch Vibe from inside the clone:

```bash
cd mistral-vibe-ek-ita
vibe
```

**Sanity check.** Ask Vibe: *"what is this repo?"*. If you get a sensible answer, you're set.

> We are not going to *develop* Vibe or write Python. We're going to use Vibe to *study* Vibe. If anything in your setup misbehaves, raise your hand — we'll fix it together rather than skip ahead.

A few things worth knowing about the Vibe interface (we'll use them later):

- `@` references a file with autocompletion.
- `!` prefix runs a shell command directly.
- `/help` lists everything else.

### Part 3 — Where is the architecture? (30 min)
With Vibe set up, look at the cloned repo in your file browser — *no source files open yet*. Just folder names, file names, and what's at the top level. Together as a class:

- What can we already say about this system without reading a single line of Python?
- What do `cli/`, `acp/`, `core/` suggest?
- What does the presence of `tests/`, `.github/workflows/`, `pyinstaller/`, `flake.nix` tell us?

The point: structure carries most of the architectural signal. You don't need to read the code to see the shape.

### Part 4 — Ask Vibe, then check (30 min)
Now turn to your agent. Run these three prompts in order. For each, *open at least one file Vibe names* and check whether the claim holds up:

1. *"Give me a one-paragraph description of what this repo is and what its top-level structure suggests about its architecture."*
2. *"What are the three or four most architecturally important files in this repo? For each, explain in one sentence why."*
3. *"Identify one boundary in this codebase — somewhere two parts have agreed on a contract. Name the boundary, the contract, and the two parts."*

You're not reading the Python. You're checking whether the named file exists, whether the claim about it is *visible* from filenames, comments, and imports. Did Vibe oversell? Did it land?

This is the smallest version of what we'll do every week: **ask, verify, refine**.

### Part 5 — Architecture vs implementation (25 min)
Not every decision in a codebase is architectural — most are just *a* reasonable choice
among several that would have worked fine. Architecture is the subset that's expensive to
undo, or that everything else quietly ends up depending on. Reuse Part 1's framings to
tell them apart: **would this be painful to change later? Is it a decision you'd want
made early, before other things get built on top of it?**

Vote first (show of hands) on each one — architecture, or implementation? — then discuss
why:

- Vibe's choice of programming language (Python).
- Vibe has separate `cli/` and `acp/` entrypoints.
- Vibe is packaged via PyInstaller, uv, *and* a Nix flake.
- The LLM-backend folder is named `backend` instead of `provider` or `vendor`.

Don't aim for a clean verdict — it's fine if the room splits on some of these. The
disagreements matter more than the answers.

### Part 6 — Pair exercise: find a component, a boundary, a convention (25 min)
In pairs, use Vibe to investigate the repo. Find one of each:

- **One component** — a part of Vibe that does one identifiable thing. (Give a file or folder path.)
- **One boundary** — a place where two parts of the system meet. (What's on each side?)
- **One convention** — a rule the codebase follows consistently. (Give two or three examples that follow the rule.)

These are the three pieces of architecture-vocabulary we introduced today. Use only those — don't reach for "layered" or "hexagonal" yet; those come later in the semester.

Write a 5-line dossier per pair (paper or markdown). Drop it in your semester notebook.

### Part 7 — Synthesis (20 min)
Each pair shares what they found. The class assembles a shared map of "things we noticed in Vibe today." We'll come back to this map all semester.

End with the semester-spanning promise: **we will return to this repo every week. You will get to know it. By session 21, you will be able to read its architecture out loud — without speaking Python.**

---

## Exercise

Write half a page on your bring-your-own system using today's vocabulary — components, boundaries, conventions, one decision you'd revisit. Drop it in your semester notebook.

---

## Investigation (after class)

The pattern: ask Vibe a real question, verify against the codebase, write up what you learned. We'll do a version of this every week.

Pick **two** of the three:

### Prompt 1 — Vibe's reading of itself
> "Describe the architecture of this repo in 5–7 bullet points. For each bullet, point to the file or folder that justifies the claim."

**Verify:** open at least two of the named paths. Does each justify the claim made about it? Note one bullet that holds up perfectly and one that's hand-wavy.

### Prompt 2 — Hidden conventions
> "What conventions does this repo follow that aren't written down anywhere? Look at folder structure, file naming, and how related files are grouped."

**Verify:** spot-check by listing the contents of two folders Vibe calls out. Does the convention actually hold? Find one place the convention is *broken* — if it always holds, the agent over-generalised.

### Prompt 3 — The hardest-to-change parts
> "Which parts of this codebase do you think would be most disruptive to change? Rank the top three and explain why."

**Verify:** for the top-ranked answer, search the repo for how many files reference it (Vibe can run this for you). Does the count match the reasoning?

### Deliverable

Half a page in your semester notebook (markdown is fine):

- **What I investigated** — which two prompts.
- **One claim Vibe got right** — and how you know.
- **One claim that was vague, wrong, or oversold** — and how you checked.
- **What changed in my understanding of architecture** — one or two sentences.

Bring it to session 7. We'll spend the first 10 minutes comparing notes.

---

## After Class

- Set up your semester notebook (digital or paper). One section per session.
- Skim ahead: session 7 covers *quality attributes* — what "good" means when you can't say "it works."

## Optional

- [optional] A one-page primer on what "software architecture" means (teacher-provided — old reading, not required).
