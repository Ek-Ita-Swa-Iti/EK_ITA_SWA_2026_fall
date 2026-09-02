# Session 5: Docker, Compose & the Cloud

**ITA Software Architecture 2026 Fall | 3 hours | Foundations block (hands-on) | Mandatory group assignment issued**

> In Session 2, 3 and 4 you *used* a container without knowing how it worked. Today you open the box: images, building your own with a `Dockerfile`, and running several containers together with `docker compose` — the exact tooling every later session uses to run code. Then we step back and ask *where* containers actually run in the real world: your own servers, or the **cloud** — and weigh the trade-offs. The session closes by handing out the **mandatory group assignment**.

---

## Learning Goals

- Explain the difference between an **image** and a **container**, and the container lifecycle.
- Write a **`Dockerfile`** and build an image from it.
- Run a container: ports, volumes, environment variables, logs, `exec`.
- Use **`docker compose`** to define and run a multi-service app.
- Read the `docker-compose.yml` files you'll meet in the rest of the semester.
- Explain where containers **run in production** (on-prem vs cloud), the cloud service models (**IaaS / PaaS / SaaS**), and **reflect on the pros and cons of cloud computing** versus other paradigms and business models.

---

## Before Class

- Docker Desktop installed and running (you've used it since Session 2).
- **A change of machine:** today you work on your **laptop** directly, *not* inside the webtop container — Docker runs on the host, and webtop can't run Docker inside itself.
- Your Git repo cloned **on your laptop**. If you only ever cloned it inside webtop (Sessions 2–4), `git clone` it again on the host now — you'll commit a Dockerfile and a Docker-compose file today.

---

## Today's Teachings

### Part 0 — Callback (10 min)
Remember the webtop container from Session 2? Today we learn what actually happened when you ran it — and you'll build your own. Note the switch: Sessions 2–4 lived *inside* that container; today you're back on your **host laptop**, because that's where Docker itself runs.

### Part 1 — Images vs containers (30 min) — blackboard
The core distinction, on the board:

- An **image** is a frozen, read-only template (like a class).
- A **container** is a running instance of an image (like an object).
- **Layers:** images are built in stacked layers; that's why builds are cached and fast.
- **Lifecycle:** `docker run` → running → `stop` → `start` → `rm`. A stopped container still exists until you remove it.

Hands-on: `docker pull`, `docker run`, `docker ps`, `docker ps -a`, `docker stop`, `docker rm`, `docker images`.

### Part 2 — Building your own image (40 min) — keyboard
Grab a tiny script to containerise — a log summariser built from Session 3 pipeline moves:

```bash
mkdir -p ~/session-05 && cd ~/session-05
base=https://raw.githubusercontent.com/Ek-Ita-Swa-Iti/EK_ITA_SWA_2026_fall/master/05._docker_compose/session-05
curl -sO "$base/report.sh" -O "$base/sample.log"
bash report.sh              # run it on the host first — 50 requests, 10 errors, top IPs
```

A `Dockerfile` is a recipe that packages that script into an image. The instructions you need:

```dockerfile
FROM debian:stable-slim         # start from a tiny base image
WORKDIR /app                    # working directory inside the container
COPY report.sh sample.log ./    # copy your files in
RUN chmod +x report.sh          # a build step — make the script executable
CMD ["./report.sh", "sample.log"]   # what to run when the container starts
```

`docker build -t myreport .` then `docker run myreport` — the same report, now from inside a container. Then the run-time essentials, each tried live:

- **Ports:** `-p 8080:8080` — map a container port to your laptop (matters once something *listens*, like the compose services in Part 3).
- **Volumes:** `-v $(pwd)/data:/data` — share a folder; data survives the container, and you can feed `report.sh` a real log without rebuilding.
- **Environment:** `-e KEY=value`. **Logs:** `docker logs <name>`. **Get a shell inside:** `docker exec -it <name> bash`.

### Part 3 — Many containers: docker compose (40 min) — keyboard, the set-piece
Real systems are more than one container. `docker compose` describes them in one file:

```yaml
services:
  app:
    build: .                     # your script's image
    environment:
      TARGET: http://web         # how app finds web — by service name
    depends_on:
      - web
  web:
    image: nginx:alpine          # a service you pull, not build
    ports:
      - "8080:80"                # reachable from your laptop too
```

- `docker compose up --build` — start everything; `down` — stop and remove it.
- Services, the **network** compose creates (`app` reaches `web` at `http://web` — by service name), `depends_on`, `logs`, `exec`.
- **The payoff:** open one of the `docker-compose.yml` files from the course examples repo and read it together — *you now understand every line.* This is what `docker compose up` runs from the architecture sessions onward.

### Part 4 — Where does this actually run? Cloud computing (30 min) — blackboard + discussion
Everything so far ran on *a machine you control* — the webtop container in Sessions 2–4, your laptop today. In the real world it runs on a server somewhere — and that "somewhere" is a real architectural and business decision.

- **Two homes for your containers:** your organisation's **own machines (on-prem)**, or rented from a **cloud** provider (AWS, Azure, GCP, …).
- **VM vs container, in one line:** a virtual machine emulates a whole computer; a container shares the host's kernel and ships just your app — lighter, faster to start, which is why cloud platforms love them.
- **Cloud service models** (board): how much the provider runs *for* you —
  - **IaaS** — they give you a bare VM; you install and run everything (your container included).
  - **PaaS** — you push code/containers; they handle the servers, scaling, patching.
  - **SaaS** — you just *use* finished software (Gmail, GitHub) — no infrastructure at all.
- **The reflection — pros & cons, and the business model:** on-prem (big upfront cost/*capex*, full control, fixed capacity, you carry the ops burden) vs cloud (pay-as-you-go/*opex*, elastic scaling, less to manage — but vendor lock-in, ongoing cost, and questions of data location/compliance). There is no universal winner; it depends on the workload and the business.

**Discussion (in groups, then share):** for each scenario, cloud or on-prem — and *why*?
- a two-person startup launching an MVP;
- a hospital storing patient records;
- a shop with huge traffic spikes on Black Friday and quiet weekdays.

> We don't *deploy* to a cloud today (that's the DevOps semester) — today is about being able to **reason** about the choice.

### Part 5 — The group assignment (10 min)
Walk through the assignment brief below, the rubric, and the deadline.

---

## Exercise (in class)

- Write a `Dockerfile` that containerises a small **script** that summarises a file — adapt `report.sh` from Part 2 or write your own Session 3-style pipeline — and run it.
- Write a small `docker-compose.yml` with **two services** and `docker compose up` it.
- Commit both to your repo and **push**.

---

## Mandatory Group Assignment — "Containerised Toolbox"

**Type**: Group\
**Hand in**: 17/9 (Wiseflow)

Build a small, runnable `docker compose` project: a shell script your group wrote, packaged in a container, that **talks to a web service running alongside it**.

**Requirements**

1. A **shell script your group wrote** that **uses a web service over the network** — and does something genuinely useful. Pick a shape:
   - a **checker** — every few seconds, `curl` the service, record the **status code and response time**, and flag when it's down or slow;
   - a **poller** — `curl` an endpoint that returns data (JSON or text), pull out the field(s) you care about with pipes, and append them to a growing log with a timestamp;
   - a **feeder** — turn some input into a file the service serves, then re-check it's served correctly.

   Session 3 skills are enough (`curl`, HTTP status codes, pipes, `grep`/`cut`/`sort`, exit codes, redirection); a `while … sleep` loop is fine — look it up. It must **handle failure gracefully** — the service not up yet, a timeout, a non-200 response (this is the Session 4 "the network is unreliable" lesson, in code). **Not** a copy of Part 2's `report.sh` — your script has to *talk to the service*.
2. A **`Dockerfile`** that packages the script into an image, with a `RUN` step that installs what it needs (e.g. `curl`, `jq`).
3. A **`docker-compose.yml`** with **two services that work together** — your script's container plus the web service it talks to. The web service can be as simple as `python3 -m http.server`. Or you can use stock images like `nginx:alpine`. They must reach each other **by service name** (e.g. `curl http://web/`).
4. The whole thing in a **Git repo on GitHub**, with a **`README.md`** that explains: what it does, how to run it (`docker compose up`), and what each file/service is responsible for.

> Optional stretch — **only if your group already knows SQL**: swap the web service for a **Postgres** container and have your script write rows into it with `psql`.

**Hand-in**

- A link to your group's **GitHub repository**, submitted via **Wiseflow** by **17/9**.
- One submission per group; list all members in the README.

**Assessment (pass / needs-rework)** — you pass when:

- [ ] `docker compose up --build` runs the project without manual fixing.
- [ ] The script runs **inside a container** and **actually calls the web service** (`curl`s it, reads its responses) — not two containers that ignore each other.
- [ ] The script **survives the service being slow or not-yet-up** (it retries or logs the failure — it doesn't just crash).
- [ ] The two services reach each other **by service name** (not a hard-coded IP).
- [ ] The README lets a stranger clone and run it, and explains each part.
- [ ] Everything is committed to Git with a sensible history (not one giant commit at the end).

---

## After Class

- In your groups create the shared GitHub repo today.
- Sketch what your toolbox will do before you start building — pick which web service it hits and what it does with the responses.
- One paragraph for yourself: for the toolbox you're about to build, would you run it on-prem or in the cloud — and which service model (IaaS/PaaS/SaaS) — and why?

---

## Optional

- [optional] The official *Docker get-started* guide — `https://docs.docker.com/get-started/`.
- [optional] AWS's plain-language *Types of Cloud Computing* (IaaS/PaaS/SaaS) — skim for the model definitions.
- [optional] *Docker Compose* docs — the `compose-file` reference, for when you want an option you haven't met.
