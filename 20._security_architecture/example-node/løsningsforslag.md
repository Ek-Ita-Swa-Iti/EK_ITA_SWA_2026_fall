# Løsningsforslag: Runde 2 · *Secrets* ud af compose-filen

Løsningen er lavet i denne mappe, `example-node` ([README.md](README.md)), på branchen `session-20-del3-loesning`.
Alle stier herunder er relative til `example-node/`.

---

## Kør løsningen

```bash
cd 20._security_architecture/example-node
cp .env.example .env            # udfyld MONGO_PASSWORD, fx med: openssl rand -hex 32
docker compose up -d --build    # første gang hentes bge-m3 (ca. 1,2 GB)
```

---

## Runde 2 · *Secrets* ud af compose-filen

### Hvad er gjort

| Fil | Ændring |
|-----|---------|
| `docker-compose.yml` (linje 10) | `MONGO_URL` er nu `mongodb://notes:${MONGO_PASSWORD:?…}@mongo:27017` |
| `docker-compose.yml` (linje 34) | `MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:?…}` i stedet for `notes123` |
| `.env.example` (ny) | Navnet `MONGO_PASSWORD=` uden værdi. Den er committet |
| `.gitignore` (ny) | `.env`, så den rigtige fil aldrig kommer i Git |
| `README.md` | "Kør det" starter nu med `cp .env.example .env` |

`.env` selv er **ikke** committet. `git status` viser den ikke, fordi den står i `.gitignore`.

### Et skridt ud over opgaven: `${VAR:?besked}`

Opgaven bruger `${MONGO_PASSWORD}`. Løsningen bruger `${MONGO_PASSWORD:?Lav en .env-fil, se .env.example}`.
Forskellen ses, når `.env` mangler:

- `${MONGO_PASSWORD}`: Compose giver en advarsel og bruger en **tom streng**. MongoDB starter med et tomt password, eller backend kan ikke logge ind, og fejlen viser sig et helt andet sted.
- `${MONGO_PASSWORD:?…}`: Compose **stopper med det samme** og skriver beskeden:

  ```
  required variable MONGO_PASSWORD is missing a value: Lav en .env-fil, se .env.example
  ```

Det er "fail fast": Hellere en tydelig fejl ved start end et system, der kører med forkert eller ingen sikkerhed.

### Svar på spørgsmålene

**Hvad viser `docker compose config`?** Den færdige compose-fil, hvor alle `${…}` er skiftet ud med værdierne fra `.env`. Passwordet står altså i **klar tekst** i outputtet:

```yaml
      MONGO_URL: mongodb://notes:9f3c…(64 tegn)…@mongo:27017
```

**Hvad betyder det, at en *secret* i en miljøvariabel stadig kan læses?** `.env` holder den ude af **Git**, men ikke ude af **maskinen**. Alle, der kan køre `docker` på maskinen, kan læse den, fx med `docker compose config`, `docker inspect` eller `docker compose exec backend printenv MONGO_URL`. Har man adgang til Docker, har man i praksis adgang til alle *secrets* i containerne. Derfor bruger rigtige systemer en secrets manager (fx GitHub Actions Secrets, HashiCorp Vault eller AWS Secrets Manager), og derfor er det vigtigt, hvem der har adgang til serveren.
