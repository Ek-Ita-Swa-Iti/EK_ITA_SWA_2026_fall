# Session 2: Terminal, Linux & Git

**ITA Software Architecture 2026 Fall | 3 hours | Foundations block (hands-on)**

> The terminal is the control panel for everything you'll do this semester — running the codebases, the AI agent, Docker, all of it. Today you get a real Linux machine (running in a container on your laptop), learn to move around it from the command line, and start saving your work with Git. No slides where we can avoid them: you'll be at the keyboard most of the time.

---

## Learning Goals

- Run a **Linux machine in a container** via Docker Desktop and reach a terminal inside it.
- Navigate a Linux filesystem: paths, directories, listing, reading files.
- Create, copy, move, and delete files and directories from the shell.
- Read and change **file permissions**; see what running **processes** are.
- Use **Git** to save and push your work — clone, commit, push (by doing, not by theory).

---

## Before Class

- Install **Docker Desktop** (Windows/macOS/Linux) and make sure it starts.
- Have a **GitHub account** and be logged in.
- That's it — your Linux environment is set up *in class*.

---

## Today's Teachings

### Part 1 — Your Linux playground (25 min)
We don't install Linux on your laptop — we **run it in a container** so everyone has the *exact same machine*. Today, Docker is just the delivery mechanism; you'll learn how it actually works in Session 5.

In **Docker Desktop**, pull and run the image **`lscr.io/linuxserver/webtop:ubuntu-mate`**, mapping port **3000**. (We'll hand you the exact run command; the gist:)

```bash
docker run -d --name webtop -p 3000:3000 \
  --shm-size=1gb \
  lscr.io/linuxserver/webtop:ubuntu-mate
```

Then open **http://localhost:3000** in your browser — that's a full Ubuntu MATE desktop running in the container. Open its **Terminal** app. Everything below happens *in that terminal*.

> **Mental model:** the desktop in your browser is a separate Linux computer. Your laptop is just the screen and keyboard. When we "stop the container" the machine is gone — so we'll use Git to save anything we want to keep.

### Part 2 — Where am I? Navigating the filesystem (35 min) — blackboard + keyboard
On the board: draw the Linux filesystem as a tree (`/`, `/home`, `/etc`, `/var`, `/tmp`). The three questions you ask constantly:

- **Where am I?** `pwd`
- **What's here?** `ls`, `ls -l`, `ls -la`
- **How do I move?** `cd`, `cd ..`, `cd ~`, absolute (`/home/abc`) vs relative (`../docs`) paths.

Reading files without opening an editor: `cat`, `less`, `head`, `tail`. Getting help: `man ls`, `ls --help`. Glob patterns: `ls *.txt`, `ls report-??.md`.

### Part 3 — Making changes: files & directories (30 min) — keyboard
`mkdir`, `touch`, `cp`, `mv`, `rm` (and the danger of `rm -r`). The tab-completion habit. Then **permissions**: what `rwx` means for user/group/other, reading `ls -l` output, and `chmod +x script.sh`. A quick look at **processes**: `ps`, `top` (then `q` to quit), and that a program is just a process.

### Part 4 — Saving your work with Git (40 min) — keyboard, no theory
You'll lose the container eventually, so put your work somewhere permanent. Purely the workflow:

```bash
git clone <your-repo-url>      # get a copy
cd <repo>
# ...make or edit files...
git status                     # what changed?
git add .                      # stage the changes
git commit -m "session 2 work" # save a snapshot
git push                       # send it to GitHub
```

What a "remote" is, shown by pushing and then seeing it on github.com. **From now on, everything you make this block lives in a Git repo** — that's also how you'll hand in the assignment in Session 5.

### Part 5 — Wrap-up (10 min)
The cheat-sheet of today's commands. Why this matters: every later session (Docker, the codebases, the AI agent) assumes you can move around a shell without thinking about it.

---

## Exercise (in class)

A **filesystem scavenger hunt** in a directory tree we've pre-seeded inside your container:

- Find a specific file several directories deep; read it; follow its instructions.
- Create a directory structure to a given spec; move and rename files into it.
- Make a script file executable (`chmod +x`) and run it.
- **Commit and push** your results to your GitHub repo before you leave.

---

## After Class

- Re-run the whole setup from scratch once on your own (new container → terminal → clone → commit → push) so it's muscle memory.
- Skim your command cheat-sheet; you'll use all of it next week.

---

## Optional

- [optional] *The Linux Command Line* by William Shotts (free online) — chapters 1–4 cover everything today and more.
- [optional] The interactive `https://gitimmersion.com` walk-through if you want extra Git reps.
