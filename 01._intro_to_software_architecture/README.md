# Session 1: Intro to Software Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> What is software architecture, really? Not the diagrams — the underlying thing the diagrams are trying to show. Today we'll set up the toolkit we'll use all semester, and then learn to point at the architecture in a real codebase you've never seen. The codebase is `mistral-vibe-ek-ita`. The tool is Mistral Vibe itself. You don't need to know Python.

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
- Make sure you have **Python 3.12 or newer** installed (`python3 --version`). If not, install it — we'll need it for the agent we set up in class.
- Bring a system **you** have built or worked on (any language, any size). Be ready to describe it in 2 minutes.
- [optional] Think for one minute about what "architecture" means to you in software. One sentence. Bring it.

---

## Today's Teachings

### Part 1 — Three definitions, side by side (20 min)
Three useful framings of architecture, all true, all slightly different:

- "Architecture is the parts that are hardest to change."
- "Architecture is the decisions you wish you'd made earlier."
- "Architecture is whatever the next developer needs to know."

Map each onto your bring-your-own system. Which fits best? Why? The three frames feel different but they're compatible — we won't pick a winner.

### Part 2 — Setting up your semester toolkit (30 min)
Two independent things to set up, then we connect them:

**A. Install Mistral Vibe (the tool).** We'll use Vibe as our agent for the whole semester — it's also the codebase we'll study, which is part of the point. We follow the official quickstart: <https://docs.mistral.ai/mistral-vibe/terminal/quickstart>.

```bash
curl -LsSf https://mistral.ai/vibe/install.sh | bash
```

Alternative if you already use `uv`:

```bash
uv tool install mistral-vibe
```

On first launch, Vibe will create `~/.vibe/config.toml` and prompt you for an API key. Create one at <https://console.mistral.ai/codestral/cli> and paste it when prompted. Your key gets saved to `~/.vibe/.env`.

**B. Clone the repo (the thing we study).**

```bash
git clone <repo-url> mistral-vibe-ek-ita
```

You'll come back to this every week. Don't delete it.

**C. Point one at the other.** Launch Vibe from inside the clone:

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
A useful test: would a competent engineer make the same call without reading the spec? If yes, it's probably implementation. If no, it's probably architectural.

Vote first, then discuss:

- Vibe's choice of programming language (Python).
- Vibe has separate `cli/` and `acp/` entrypoints.
- Vibe is packaged via PyInstaller, uv, *and* a Nix flake.
- The LLM-backend folder is named `backend` instead of `provider` or `vendor`.

The disagreements matter more than the answers.

### Part 6 — Pair exercise: find a component, a boundary, a convention (25 min)
In pairs, use Vibe to investigate the repo. Find one of each:

- **One component** — a part of Vibe that does one identifiable thing. (Give a file or folder path.)
- **One boundary** — a place where two parts of the system meet. (What's on each side?)
- **One convention** — a rule the codebase follows consistently. (Give two or three examples that follow the rule.)

These are the three pieces of architecture-vocabulary we introduced today. Use only those — don't reach for "layered" or "hexagonal" yet; those come later in the semester.

Write a 5-line dossier per pair (paper or markdown). Drop it in your semester notebook.

### Part 7 — Synthesis (20 min)
Each pair shares what they found. The class assembles a shared map of "things we noticed in Vibe today." We'll come back to this map all semester.

End with the semester-spanning promise: **we will return to this repo every week. You will get to know it. By session 22, you will be able to read its architecture out loud — without speaking Python.**

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

Bring it to session 2. We'll spend the first 10 minutes comparing notes.

---

## After Class

- Set up your semester notebook (digital or paper). One section per session.
- Skim ahead: session 2 covers *quality attributes* — what "good" means when you can't say "it works."

## Optional

- [optional] A one-page primer on what "software architecture" means (teacher-provided — old reading, not required).
