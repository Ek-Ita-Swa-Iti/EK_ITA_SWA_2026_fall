# Session 2: Terminal, Linux & Git

**ITA Software Architecture 2026 Fall | 3 hours | Foundations block (hands-on)**

> The terminal is the control panel for everything you'll do this semester — running the codebases, the AI agent, Docker, all of it. Today you get a real Linux machine (running in a container on your laptop), learn to move around it from the command line, and start saving your work with Git. No slides where we can avoid them: you'll be at the keyboard most of the time.

---

## Learning Goals

- Run a **Linux machine in a container** via Docker Desktop and reach a terminal inside it.
- Navigate a Linux filesystem: paths, directories, listing, reading files.
- Create, copy, move, and delete files and directories from the shell.
- Read and change **file permissions** — and know why **root** can ignore them; see what running **processes** are.
- Install software with a **package manager** (`apt`) — and recognise the same idea across OSes (`brew`, `choco`) and inside a `Dockerfile`.
- See how the **Mistral-Vibe** agent runs the *same* terminal commands you're learning — and use that to read and verify what it does.
- Use **Git** to save and push your work — clone, commit, push (by doing, not by theory).

---

## Before Class

- Install **Docker Desktop** (Windows/macOS/Linux) and make sure it starts.
- Have a **GitHub account** and be logged in.
- Have **Mistral-Vibe** installed (from Session 1).
- That's it — your Linux environment is set up *in class*.

---

## Today's Teachings

### Part 1 — Your Linux playground (25 min)
We don't install Linux on your laptop — we **run it in a container** so everyone has the *exact same machine*. Today, Docker is just the delivery mechanism; you'll learn how it actually works in Session 5.

In your Terminal or PowerShell, paste in the following command:

```bash
docker run -d --name webtop -p 3000:3000 --shm-size=1gb lscr.io/linuxserver/webtop:ubuntu-mate
```

Then open **http://localhost:3000** in your browser — that's a full Ubuntu MATE desktop running in the container. Open its **Terminal** app. Everything below happens *in that terminal*.

> **Mental model:** the desktop in your browser is a separate Linux computer. Your laptop is just the screen and keyboard. When we "stop the container" the machine is gone — so we'll use Git to save anything we want to keep.

**Stopping and deleting the container.** When you're done for the day (or want a completely fresh machine), open Docker Desktop, find `webtop` under **Containers**, click **Stop**, then **Delete** to remove it entirely. Next time you want the playground back, just re-run the `docker run` command above.

### Part 2 — Where am I? Navigating the filesystem (30 min) — blackboard + keyboard
On the board: draw the Linux filesystem as a tree (`/`, `/home`, `/etc`, `/var`, `/tmp`). The three questions you ask constantly:

- **Where am I?** `pwd`
- **What's here?** `ls`, `ls -l`, `ls -la`
- **How do I move?** `cd`, `cd ..`, `cd ~`, absolute (`/home/abc`) vs relative (`../docs`) paths.

Reading files without opening an editor: `cat`, `less`, `head`, `tail`. Getting help: `man ls`, `ls --help`. Glob patterns: `ls *.txt`, `ls report-??.md`.

### Part 3 — Making changes: files & directories (30 min) — keyboard
`mkdir`, `touch`, `cp`, `mv`, `rm` (and the danger of `rm -r`). The tab-completion habit. Then **permissions**: what `rwx` means for user/group/other, reading `ls -l` output, and `chmod +x script.sh`.

**One catch — `root` ignores read/write permissions.** In this container you're logged in as **root**, the all-powerful admin user. Try it: `chmod 000 afile` (remove *all* permissions) then `cat afile` — it still works, because root is allowed to bypass the read/write bits. As a *normal* user that same `chmod 000` would lock you out. (Execute is stricter: even root needs an `x` bit to run `./afile`.) The lesson: permissions protect you from *other* users — and root is above them. `whoami` tells you who you are.

A quick look at **processes**: `ps`, `top` (then `q` to quit), and that a program is just a process.

### Part 4 — Getting software onto the machine: package managers (15 min) — keyboard
You've got a Linux machine — but how does *new software* get onto it? Not by hunting the web for random files: a **package manager** installs a program (and everything it depends on) from a trusted repository, in one command.

On this Ubuntu container that's **`apt`**:

```bash
apt update            # refresh the list of available packages
apt install tree      # install the "tree" program and its dependencies
tree                  # ...now it's there
```

- **Every OS has one, same idea, different name:** `apt` (Debian/Ubuntu), **Homebrew** `brew` (macOS), `choco`/`winget` (Windows). This is how you got Docker/Git onto your laptop, whether you noticed or not.
- **The forward link:** installing software is a *repeatable, scriptable* step — which is exactly what a **`Dockerfile`** does when it says `RUN apt-get install …` or `RUN pip install …` (Session 5). No manual click-through; the recipe installs it every time.

> Language package managers — **`pip`** (Python), **`npm`** (Node) — are the same idea one level up: they install *libraries for a project* rather than *programs for the machine*.

### Part 5 — The agent speaks terminal: Mistral-Vibe (25 min) — demo + keyboard
You installed **Mistral-Vibe** last session. Here's the thing worth seeing today: an AI coding agent has no magic access to your machine — it gets work done by **running the same terminal commands you just learned** (`ls`, `cd`, `cat`, `grep`, `find`, …), reading the output, and deciding what to do next. So the terminal isn't *replaced* by the agent — it's the language you both speak, and it's how you check the agent's work.

**Demo (instructor):** point Mistral-Vibe at your scavenger-hunt directory and give it a plain-English task — *"what files are in here?"*, *"find the file that mentions Ada"*, *"show me what config.txt contains."* Watch the **commands it runs** and name each one out loud: that's the `ls` you learned, that's `find`, that's `grep`, that's `cat`.

**Hands-on cross-reference (you):** for each task, **do it yourself first**, then ask Vibe to do the same, and compare the command it used to yours:

| You type | You ask Vibe | Same command underneath |
|---|---|---|
| `ls -la` | "list everything here, including hidden files" | `ls` |
| `grep -ri "todo" .` | "find every TODO in this folder" | `grep` |
| `cat notes.md` | "what does notes.md say?" | `cat` |
| `find . -name "*.log"` | "find all the log files" | `find` |

**The point — verification, not magic:** because you know these commands, you can *read* what the agent did and **check it yourself** (`ls`, `cat`) instead of taking its word. That habit — direct the agent, then verify against the real thing — is one you'll use all semester. (Later you'll even read the *code* of a tool like this; today you just watch it speak terminal.)

### Part 6 — Saving your work with Git (40 min) — keyboard, no theory
You'll lose the container eventually, so put your work somewhere permanent. First, on github.com: create a **new, empty repository** under your own account (no README/license needed — you'll push into it). Copy its URL. Then, purely the workflow:

```bash
git clone <your-new-repo-url>  # get a copy
cd <repo-name>
# ...make or edit files...
git status                     # what changed?
git add .                      # stage the changes
git commit -m "session 2 work" # save a snapshot
git push                       # send it to GitHub
```

What a "remote" is, shown by pushing and then seeing it on github.com. **From now on, everything you make this block lives in a Git repo** — that's also how you'll hand in the assignment in Session 5.

### Part 7 — Wrap-up (10 min)
The cheat-sheet of today's commands. Why this matters: every later session (Docker, the codebases, the AI agent) assumes you can move around a shell without thinking about it — and, as you saw, the agent runs these very commands, so reading them is how you stay in control.

---

## Exercise (in class)

A **filesystem scavenger hunt** in a directory tree we've pre-seeded inside your container:

- Find a specific file several directories deep; read it; follow its instructions.
- Create a directory structure to a given spec; move and rename files into it.
- Make a script file executable (`chmod +x`) and run it.
- **Install a tool** with `apt` (e.g. `tree` or `jq`) and use it once.
- **Cross-check with Mistral-Vibe:** pick two hunt steps, ask Vibe to do them, and note which command it ran — then verify its answer yourself with `ls`/`cat`. Did it match what you did?
- **Commit and push** your results to your GitHub repo before you leave.

---

## After Class

- Re-run the whole setup from scratch once on your own (new container → terminal → clone → commit → push) so it's muscle memory.
- Skim your command cheat-sheet; you'll use all of it next week.

---

## Optional

- [optional] *The Linux Command Line* by William Shotts (free online) — chapters 1–4 cover everything today and more.
- [optional] The interactive `https://gitimmersion.com` walk-through if you want extra Git reps.
