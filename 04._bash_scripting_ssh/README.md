# Session 4: Bash Scripting & Remote Machines (SSH)

**ITA Software Architecture 2026 Fall | 3 hours | Foundations block (hands-on)**

> A script is just commands in a file — but with variables, conditions, and loops, it becomes a real tool you can re-run and share. Today you'll write proper bash scripts, make them robust, and then **run one on a different machine over SSH** — the everyday way developers work with remote servers.

---

## Learning Goals

- Write a **bash script**: shebang, variables, arguments, conditionals, loops, functions.
- Make scripts **safe and debuggable** (`set -euo pipefail`, `set -x`, exit status).
- Connect to a remote Linux machine with **SSH** using key-based auth.
- Copy files with **`scp`** and run your script on the remote box.

---

## Before Class

- Webtop Linux container running, terminal open, your Git repo cloned inside it.
- Bring the pipelines you wrote last week — some of them become scripts today.

---

## Today's Teachings

### Part 0 — Warm-up (10 min)
Recap exit codes (`$?`) and pipes from last week. Take one pipeline from Session 3 and ask: "how would I re-run this every day without retyping it?" → that's a script.

### Part 1 — Your first script (30 min) — blackboard + keyboard
Anatomy of a script, line by line on the board:

```bash
#!/usr/bin/env bash      # shebang: which interpreter runs this
echo "Hello, $USER"      # variables
```

Make it executable (`chmod +x hello.sh`) and run it (`./hello.sh`). Variables and **quoting** (why `"$var"` with quotes matters). Reading **arguments**: `$1`, `$2`, `$@`. Reading input: `read`.

### Part 2 — Logic: conditionals & loops (40 min) — keyboard
- **Conditionals:** `if [ -f "$file" ]; then ... fi`; test files, strings, numbers; `&&` and `||`.
- **Loops:** `for f in *.log; do ... done`; `while` loops.
- **Functions:** group reusable logic; return values via exit status.

Built up live by turning a Session-3 pipeline into a parameterised script (e.g. `summarise.sh access.log`).

### Part 3 — Writing scripts that don't bite you (25 min) — blackboard
The line that belongs at the top of every serious script:

```bash
set -euo pipefail   # exit on error, on unset variable, and on any failure in a pipe
```

What each flag prevents, with a quick "look how this silently does the wrong thing without it" demo. Debugging with `set -x` (trace every line). Exit your own script with a meaningful status (`exit 1`).

### Part 4 — Remote machines with SSH (40 min) — keyboard
Real infrastructure lives on *other* machines. SSH is how you reach them.

- **Keys, not passwords:** `ssh-keygen`, what the public/private key pair is, why keys beat passwords (a forward link to the Security session later in the semester).
- **Connect:** `ssh user@host` — you're now in a shell on the *other* machine.
- **Copy files:** `scp script.sh user@host:~/` — move your script across.
- **Run it there:** SSH in, `chmod +x`, run; or run a command directly: `ssh user@host 'bash ~/script.sh'`.

We provide a second Linux container as the "remote server" so everyone has something real to SSH into.

### Part 5 — Wrap-up (15 min)
Recap: a script is a tool; SSH puts your tools on any machine. Commit your scripts to GitHub.

---

## Exercise (in class)

Write and push the following:

- A script `report.sh` that takes a log file as an argument (`$1`), and prints total lines, error count, and the top 3 IPs — reusing last week's pipelines. Starts with `set -euo pipefail` and errors clearly if the file is missing.
- A script with a **loop** that processes every `*.log` file in a directory.
- **SSH** into the provided remote container, `scp` your `report.sh` over, and run it there against a log file on the remote machine.
- Commit both scripts to your repo and **push**.

---

## After Class

- Add one improvement to `report.sh`: a `--help` message, or handle the "no argument given" case gracefully.
- **Next week is Docker + the group assignment** — make sure Docker Desktop still runs on your laptop.

---

## Optional

- [optional] *The Linux Command Line* (Shotts), Part 4 — writing shell scripts.
- [optional] Google's *Shell Style Guide* — skim it once; good habits, not gospel.
- [optional] ShellCheck (`https://www.shellcheck.net`) — paste a script in, it finds your bugs.
