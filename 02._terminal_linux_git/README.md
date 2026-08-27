# Session 2: Terminal, Linux & Git

**ITA Software Architecture 2026 Fall | 3 hours | Foundations block (hands-on)**

> The terminal is the control panel for everything you'll do this semester — running the codebases, the AI agent, Docker, all of it. Today you get a real Linux machine (running in a container on your laptop), learn to move around it from the command line, and start saving your work with Git. No slides where we can avoid them: you'll be at the keyboard most of the time.

---

## Learning Goals

- Run a **Linux machine in a container** via Docker Desktop and reach a terminal inside it.
- Navigate a Linux filesystem: paths, directories, listing, reading files.
- Create, copy, move, and delete files and directories from the shell.
- Read and change **file permissions** — `rwx` for user/group/other, and `chmod +x`.
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
The Linux file system:

```
/
├── bin
├── home
├── etc
├── var
├── tmp
├── usr
└── lib
```

The three questions you ask constantly:

- **Where am I?** `pwd`
- **What's here?** `ls`, `ls -l`, `ls -la`
- **How do I move?** `cd`, `cd ..`, `cd ~`, absolute (`/home/abc`) vs relative (`../docs`) paths.

Reading files without opening an editor: `cat`, `less`, `head`, `tail`. Getting help: `man ls`, `ls --help`. Glob patterns: `ls *.txt`, `ls report-??.md`.

### Part 3 — Making changes: files & directories (30 min) — keyboard
`mkdir`, `touch`, `cp`, `mv`, `rm` (and the danger of `rm -r`). The tab-completion habit. Then **permissions**: what `rwx` means for user/group/other, reading `ls -l` output, and `chmod +x script.sh`.

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
You installed **Mistral-Vibe** on your laptop last session — but webtop is a *separate* Linux machine (remember the mental model from Part 1), so it isn't there yet. Install it in this container first:

```bash
curl -LsSf https://mistral.ai/vibe/install.sh | bash
```

Same one-liner as Session 1. On first launch it'll ask for an API key again (`~/.vibe/config.toml` is fresh in this container) — reuse the one you created last time.

Here's the thing worth seeing today: an AI coding agent has no magic access to your machine — it gets work done by **running the same terminal commands you just learned** (`ls`, `cd`, `cat`, `grep`, `find`, …), reading the output, and deciding what to do next. So the terminal isn't *replaced* by the agent — it's the language you both speak, and it's how you check the agent's work.

**Set up a demo directory:**

```bash
mkdir -p ~/hunt/{docs,config,logs,archive/old}
echo "Start here. Your next clue is in config/secret.txt." > ~/hunt/docs/start.txt
echo "Nice work. Final step: make archive/old/prize.sh executable, then run it with ./prize.sh" > ~/hunt/config/secret.txt
printf '#!/usr/bin/env bash\necho "You found and ran the script. Commit this output."\n' > ~/hunt/archive/old/prize.sh
# prize.sh has NO execute bit — students must 'chmod +x' it (even root needs an x bit to run ./prize.sh)
echo "ada,lovelace" > ~/hunt/docs/people.csv
```

**Demo (instructor):** point Mistral-Vibe at `~/hunt` and give it a plain-English task — *"what files are in here?"*, *"find the file that mentions Ada"*, *"show me what config/secret.txt says."* Watch the **commands it runs** and name each one out loud: that's the `ls` you learned, that's `find`, that's `grep`, that's `cat`.

**Hands-on cross-reference (you):** for each task, **do it yourself first**, then ask Vibe to do the same, and compare the command it used to yours:

| You type | You ask Vibe | Same command underneath |
|---|---|---|
| `ls -la ~/hunt` | "list everything in hunt, including hidden files" | `ls` |
| `grep -ri "ada" ~/hunt` | "find the file that mentions Ada" | `grep` |
| `cat ~/hunt/config/secret.txt` | "what does secret.txt say?" | `cat` |
| `find ~/hunt -name "*.sh"` | "find all the shell scripts" | `find` |

**The point — verification, not magic:** because you know these commands, you can *read* what the agent did and **check it yourself** (`ls`, `cat`) instead of taking its word. That habit — direct the agent, then verify against the real thing — is one you'll use all semester. (Later you'll even read the *code* of a tool like this; today you just watch it speak terminal.)

### Part 6 — Saving your work with Git (40 min) — keyboard, no theory
You'll lose the container eventually, so put your work somewhere permanent. First, on github.com: create a **new, empty repository** under your own account (no README/license needed — you'll push into it). Copy its URL.

Then, in your webtop terminal:

```bash
git clone <your-new-repo-url>  # get a copy
cd <repo-name>
```

**Install `nano`** — it's not preinstalled in this container:

```bash
apt install nano
```

Write a README:

```bash
nano README.md
```

Type a line or two, then save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`). Then, purely the workflow:

```bash
git status                     # what changed?
git add .                      # stage the changes
git commit -m "session 2 work" # save a snapshot
git push                       # send it to GitHub
```

**Authenticating with GitHub.** `git push` will ask for a username and password — but GitHub no longer accepts your account password here. You need a **personal access token (PAT)** instead:

1. On github.com: **Settings → Developer settings → Personal access tokens → Tokens (classic)** → **Generate new token**. Give it the `repo` scope and an expiry, then **copy the token** — you only see it once.
2. When `git push` prompts for a password, paste the token instead of your GitHub password.
3. So you don't have to paste it every time: `git config --global credential.helper store` caches it after the first successful push.

### Part 7 — Wrap-up (10 min)
The cheat-sheet of today's commands:

- **Getting the machine running** (Part 1): `docker run`
- **Navigating** (Part 2): `pwd`, `ls`, `ls -l`, `ls -la`, `cd`, `cd ..`, `cd ~`, `cat`, `less`, `head`, `tail`, `man`, `ls --help`
- **Making changes** (Part 3): `mkdir`, `touch`, `cp`, `mv`, `rm`, `rm -r`, `chmod`, `chmod +x`
- **Installing software** (Part 4): `apt update`, `apt install`
- **Mistral-Vibe** (Part 5): `curl ... | bash` (install), `vibe`
- **Git** (Part 6): `git clone`, `git status`, `git add`, `git commit -m`, `git push`

Why this matters: every later session (Docker, the codebases, the AI agent) assumes you can move around a shell without thinking about it — and, as you saw, the agent runs these very commands, so reading them is how you stay in control.

---

## Exercise (in class)

### Download these files

In your Linux application, `cd` into the `/tmp` folder.

Then use the commands:

```bash
wget https://raw.githubusercontent.com/techkea/f23/master/materialer/unix_exercises/ex1.acc
wget https://raw.githubusercontent.com/techkea/f23/master/materialer/unix_exercises/ex1.dat
wget https://raw.githubusercontent.com/techkea/f23/master/materialer/unix_exercises/orphans.sp
```

Notice that `wget` might not be installed on your system. If not, you have to install it first.

You can play around with these files as much as you like. If you change or destroy them, just download them again.

Note: it is not all commands that have been covered in class or the material, so you will have to search for how to solve some of the problems. You are welcome to work together, but you all have to do the exercises individually.

### Exercises

1. Start by creating a directory (folder) where all the exercise files will be placed.
1. Create a file with the name `to_be_deleted.txt`.
1. Delete the file `to_be_deleted.txt`.
1. Move the 3 exercise files into this directory.
1. Use a text editor (`nano`) to create a file called `mycommands.txt` where you write all commands and observations you make in the following exercises. Use copy/paste to copy the commands from the terminal into your text file.
1. First, list the files in the directory.
1. Copy `ex1.acc` to `myfile.acc`.
1. Look at the content of both files to ensure they are identical.
1. Copy `ex1.dat` to `myfile.acc`.
1. Check that the content of `myfile.acc` changed.
1. Delete `myfile.acc`.
1. Make a directory `test` and move the three files to it.
1. Make a directory `data` and move the three files to that instead.
1. Remove the `test` directory.
1. Change directory to `data` and confirm that you succeeded.
1. Go back to the home directory or work directory afterwards.
1. Make three new directories called "newtest" — one inside the other, like a Russian doll.
1. Move the `data` directory to the innermost "newtest" directory.
1. Confirm that the three files are moved along with the `data` directory.
1. Copy the three files to your home (your top) directory.
1. Remove all "newtest" directories and the data inside them, with a single command.
1. Count the lines in `ex1.acc` and `ex1.dat`.
1. Concatenate `ex1.acc` and `ex1.dat` into the file `ex1.tot`, i.e. copy the content of two files into one new file. Verify that all gene IDs come first, followed by numerical data.
1. Merge/paste `ex1.acc` and `ex1.dat` together into `ex1.tot`, thus destroying the old file. Verify that corresponding gene IDs and numerical data are put on the same line.
1. Extract (`cut`) SwissProt ID and the 3rd numerical data column (columns 1 and 5) from `ex1.tot`. Put the results into a file `ex1.res`.
1. Find the 3 SwissProt IDs in `ex1.res` which have the largest number(s) in column 2, i.e. the top 3 entries.

_(c) 2016 by Peter Wad Sackett, pws@cbs.dtu.dk (ed. clbo@kea.dk 2019)_

---

## After Class

- Re-run the whole setup from scratch once on your own (new container → terminal → clone → commit → push) so it's muscle memory.
- Skim your command cheat-sheet; you'll use all of it next week.

---

## Optional

- [optional] *The Linux Command Line* by William Shotts (free online) — chapters 1–4 cover everything today and more.
- [optional] The interactive `https://gitimmersion.com` walk-through if you want extra Git reps.
