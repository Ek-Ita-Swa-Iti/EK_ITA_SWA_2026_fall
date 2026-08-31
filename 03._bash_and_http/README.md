# Session 3: The Command Line — Pipes & HTTP

**ITA Software Architecture 2026 Fall | 3 hours | Foundations block (hands-on)**

> The Unix idea: small tools that each do one thing, joined together. Today you'll learn to *compose* commands with pipes to answer real questions about data. Then you'll meet `curl` and just enough **HTTP** to talk to a web service from the terminal — reading a resource, sending one, and attaching a token so the server knows who you are.

---

## Learning Goals

- Understand **stdin / stdout / stderr** and wire commands together with **pipes** and **redirection**.
- Use the core text tools — `grep`, `sort`, `uniq`, `wc`, `cut`, `find`, and a little `awk` — to slice data.
- Use **`curl`** to make HTTP requests; read methods, status codes, headers, and JSON.
- Send an **authenticated request** — a bearer token in a header, read from an environment variable, never committed.

---

## Before Class

- Have your **webtop Linux container** from Session 2 running, with a terminal open.
- Have your Git repo cloned inside it (you'll commit today's work).

---

## Today's Teachings

> Today everything runs **inside the webtop container (Docker container)** from Session 2, not "on" your laptop.

### Part 0 — Warm-up (10 min)
Quick recap of last week's navigation — `pwd`, `ls`, `ls -l`, `ls -la`, `cd`, `cd ..`, `cd ~`, `cat`. Then pull down today's data — a real-ish web-server **access log** (~300 lines) and a small **CSV** — into a fresh folder:

```bash
mkdir -p ~/session-03 && cd ~/session-03
base=https://raw.githubusercontent.com/Ek-Ita-Swa-Iti/EK_ITA_SWA_2026_fall/master/03._bash_and_http/session-03
curl -sO "$base/access.log" -O "$base/data.csv"
ls -l                 # access.log, data.csv
head -3 access.log    # IP - - [date:time] "METHOD path" status
```

Every command below works on these two files. One log line looks like:

```
203.0.113.7 - - [10/Oct/2026:13:40:37] "POST /api/checkout" 503
```

— the fields are space-separated, so the client IP is `cut -d' ' -f1` and the timestamp is field 4.

### Part 1 — Streams, pipes & redirection (30 min) — blackboard + keyboard
Every program has three streams — **stdin** (input), **stdout** (normal output), **stderr** (error messages).

Try it with `cat`:

```bash
cat data.csv    # a filename → cat reads the file; contents go to stdout
cat             # no filename → cat reads stdin (type a line, Enter; Ctrl+D to stop)
cat nope        # can't open it → "cat: nope: No such file or directory" to stderr
```

Both land on your screen by default, so they look the same — but they're *separate* channels. That separation is what lets you capture or send one somewhere without the other. Two ways to do that:

- **Pipe** `|` — feed one command's stdout into the next command's stdin: `cat access.log | wc -l`.
- **Redirect** `>` (overwrite), `>>` (append), `<` (read from a file): `ls > files.txt` writes the listing into a file instead of the screen.

The Unix philosophy: don't hunt for one big command — *chain small ones*.

### Part 2 — The text toolkit (40 min) — keyboard
Each tool, tried on `access.log` (and `data.csv` for the CSV example):

```bash
grep '"POST' access.log                 # find lines matching a pattern
grep -c ' 404$' access.log              # ...or just count them  (-c)
wc -l access.log                        # count lines → 300 requests

cut -d' ' -f1 access.log                # cut out a field: space-separated, field 1 = IP
cut -d',' -f2 data.csv                  # comma-separated, field 2 = country

cut -d' ' -f7 access.log | sort | uniq -c   # sort, then uniq -c = a tally (per status code)
cut -d' ' -f7 access.log | sort -n          # sort -n = numeric order; add -r to reverse it

find ~ -name '*.log'                     # locate files by name
awk '{print $1, $7}' access.log          # print fields by number ($1 = IP, $7 = status)
awk '$7 >= 500' access.log               # ...or filter: only server-error lines
```

`uniq` only collapses *adjacent* duplicates — that's why it's always `sort | uniq`.

**"The 5 busiest IPs":** build it one stage at a time, re-running as it grows:

```bash
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head -5
```

**Exit codes** (`echo $?`), env vars (`echo $HOME`, `export`), and `PATH`.

### Part 3 — Talking to the web with curl + HTTP (35 min) — keyboard
`curl` fetches URLs. Just enough HTTP to use it — against the **GitHub API** (`api.github.com`): no key for reads, a **token** for writes.

**Reads — `GET`:**

```bash
curl https://api.github.com/users/torvalds              # fetch a resource as JSON
curl -s https://api.github.com/repos/torvalds/linux     # -s = quiet (drop the progress meter)

curl -I https://api.github.com/users/torvalds           # -I = headers only: status line, content-type, x-ratelimit-*
curl -s -o /dev/null -w "%{http_code}\n" https://api.github.com/users/torvalds          # just the status → 200
curl -s -o /dev/null -w "%{http_code}\n" https://api.github.com/users/no-such-user-xyz  #                 → 404

curl -s https://api.github.com/users/torvalds | grep -E '"(login|name|public_repos)"'  # pipe JSON into the Part-2 tools
```

**Writes — `POST`, with your identity attached.** A `POST` that changes something needs a token. Reuse the **personal access token from Session 2** (classic, `repo` scope), in an environment variable so it never lands in a file:

```bash
export TOKEN=ghp_xxxxxxxxxxxx     # paste your Session 2 token at the prompt — never into answers.sh

curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.github.com/user/repos   # → 401: no token, GitHub can't tell who you are

curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "s3-api-test", "private": true}' \
  | grep -E '"(full_name|html_url)"'   # → 201 Created — refresh github.com, the repo is really there
```

Delete `s3-api-test` from its **Settings → Danger Zone** when you're done (the `repo` scope creates repos but can't delete them).

- **Methods:** `GET` reads, `POST` sends (`-d '{...}'` is the body).
- **Status codes:** `200` ok, `201` created, `401`/`403` not allowed, `404` missing, `500` server broke.
- An authenticated call also lifts the rate limit from **60 to 5000 requests/hour** — the fix if you hit `403 {"message": "API rate limit exceeded"}`.

> A preview, not the full story — we design HTTP APIs properly later. Today: *poke* a web service from the terminal.

### Part 4 — Wrap-up (10 min)
Two threads, recapped: compose small tools with pipes to answer questions about data; and use `curl` to talk to a web service over HTTP — reads, writes, and a token that says who you are. Commit today's work (no secret in the file).

---

## Exercise (in class)

Using **only the terminal**, save your commands to a file and push:

- From the log: total requests, error count, the 5 busiest IPs, the busiest hour.
- From the CSV: extract a column, sort it, count unique values.
- With `curl`: fetch from the **GitHub API**, show its status code, and extract one field from the JSON.
- Make one **authenticated request** using a token in an `Authorization` header, with the token read from an **environment variable** (not written in the file).
- Save commands in `answers.sh` (commented) and **push to GitHub** — with no secret in the file.

---

## After Class

- Re-solve two exercise questions a *different* way (same answer, different tools).
- In one sentence: how does the GitHub API know a `POST` came from *you* and not someone else — and where does the token that proves it live?

---

## Optional

- [optional] *The Linux Command Line* (Shotts), Part 2 — redirection, pipes, text tools.
- [optional] Skim `man curl` EXAMPLES — there's a lot `curl` does that we didn't touch.
