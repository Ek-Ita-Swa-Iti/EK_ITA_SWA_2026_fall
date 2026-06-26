# Session 3: The Command Line — Pipes, Text & HTTP

**ITA Software Architecture 2026 Fall | 3 hours | Foundations block (hands-on)**

> The Unix idea: small tools that each do one thing, joined together. Today you'll learn to *compose* commands — pipe the output of one into the next — to answer real questions about files and data. Then you'll meet `curl`, the command-line way to talk to the web, and get just enough **HTTP** to use it. (You'll see `curl` again when we design REST APIs later in the semester.)

---

## Learning Goals

- Understand **stdin / stdout / stderr** and wire commands together with **pipes** and **redirection**.
- Use the core text tools — `grep`, `sort`, `uniq`, `wc`, `cut`, `find`, and a little `sed`/`awk` — to slice data.
- Read **exit codes** and understand environment variables and `PATH`.
- Use **`curl`** to make HTTP requests; read methods, status codes, headers, and JSON responses.

---

## Before Class

- Have your **webtop Linux container** from Session 2 running, with a terminal open.
- Have your Git repo cloned inside it (you'll commit today's work).

---

## Today's Teachings

### Part 0 — Warm-up (10 min)
Two-minute recap of last week's navigation commands, then `cd` into a `session-03/` folder we've seeded with a sample **log file** and a **CSV** to work on.

### Part 1 — Streams, pipes & redirection (35 min) — blackboard + keyboard
On the board: every program has three streams — **stdin** (in), **stdout** (out), **stderr** (errors). The two moves that change everything:

- **Pipe** `|` — send one command's output into the next: `cat access.log | wc -l`.
- **Redirect** `>` (overwrite), `>>` (append), `<` (read from file): `ls > files.txt`.

The Unix philosophy: don't look for one big command — *chain small ones*.

### Part 2 — The text toolkit (45 min) — keyboard
Each tool, then immediately used on the sample log:

- `grep` — find lines matching a pattern (`grep ERROR access.log`).
- `wc -l` — count lines. `sort` / `sort -n` — order. `uniq -c` — count duplicates.
- `cut -d',' -f1` — pull a column out of CSV. `find` — locate files by name/type.
- A gentle taste of `sed 's/old/new/'` (substitute) and `awk '{print $1}'` (fields).

**Building a pipeline live (the set-piece):** "Which 5 IP addresses hit the server most?" Build it one stage at a time on the board and in the terminal:

```bash
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head -5
```

Each added stage, re-run, see it get closer. This *is* the lesson.

### Part 3 — Exit codes, env vars & PATH (20 min)
`echo $?` after a command — 0 means success, non-zero means failure (you'll rely on this when scripting next week). Environment variables: `echo $HOME`, `export NAME=value`. What `PATH` is and why "command not found" happens.

### Part 4 — Talking to the web with curl + HTTP (40 min) — keyboard
`curl` is just another command-line tool — it fetches URLs. Enough HTTP to use it:

- **Methods:** `GET` (read) vs `POST` (send). `curl https://api.github.com/users/torvalds` (GET).
- **Status codes:** `200` OK, `404` not found, `500` server error. See them with `curl -i` (show headers) and `curl -o /dev/null -w "%{http_code}\n"`.
- **Headers** and **JSON bodies**; sending data: `curl -X POST -H "Content-Type: application/json" -d '{...}' <url>`.
- Pipe a JSON response into the tools you just learned to pull out a field.

> This is a preview, not the full story — we design HTTP APIs properly later in the semester. Today: be able to *poke* a web service from the terminal.

### Part 5 — Wrap-up (10 min)
The pipeline mindset, recapped. Commit today's pipelines/notes to your repo.

---

## Exercise (in class)

Using **only the terminal**, answer questions about the seeded data and save your commands to a file:

- From the log: how many total requests? How many errors? The 5 busiest IPs? The busiest hour?
- From the CSV: extract one column, sort it, count unique values.
- With `curl`: fetch a public API endpoint, show its status code, and extract one field from the JSON.
- Save your commands in `answers.sh` (one per line, commented) and **push to GitHub**.

---

## After Class

- Re-solve two of the exercise questions a *different* way (different tools, same answer) — there's always more than one pipeline.

---

## Optional

- [optional] *The Linux Command Line* (Shotts), Part 2 — redirection, pipes, and the text-processing tools.
- [optional] Skim the `curl` man page intro (`man curl`) — just the EXAMPLES section.
