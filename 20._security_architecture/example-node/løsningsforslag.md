# Løsningsforslag: Del 3 · Giv notes-service en nøgle

Løsningen er lavet i denne mappe, `example-node` ([README.md](README.md)), på branchen `session-20-del3-loesning`.
Alle stier herunder er relative til `example-node/`.

---

## Kør løsningen

```bash
cd 20._security_architecture/example-node
cp .env.example .env            # udfyld begge værdier, fx med: openssl rand -hex 32
docker compose up -d --build
docker compose exec ollama ollama pull bge-m3
docker compose restart backend
```

---

## 3a · *Secrets* ud af compose-filen

### Hvad er gjort

| Fil | Ændring |
|-----|---------|
| `docker-compose.yml` (linje 7–8) | `MONGO_URL` er nu `mongodb://notes:${MONGO_PASSWORD:?…}@mongo:27017`. `NOTES_API_TOKEN: ${NOTES_API_TOKEN:?…}` er ny |
| `docker-compose.yml` (linje 29) | `MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:?…}` i stedet for `notes123` |
| `.env.example` (ny) | Navnene `MONGO_PASSWORD=` og `NOTES_API_TOKEN=` uden værdier. Den er committet |
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

**Hvad viser `docker compose config`?** Den færdige compose-fil, hvor alle `${…}` er skiftet ud med værdierne fra `.env`. Passwordet og tokenet står altså i **klar tekst** i outputtet:

```yaml
      MONGO_URL: mongodb://notes:9f3c…(64 tegn)…@mongo:27017
      NOTES_API_TOKEN: 4a1e…(64 tegn)…
```

**Hvad betyder det, at en *secret* i en miljøvariabel stadig kan læses?** `.env` holder den ude af **Git**, men ikke ude af **maskinen**. Alle, der kan køre `docker` på maskinen, kan læse den, fx med `docker compose config`, `docker inspect` eller `docker compose exec backend printenv NOTES_API_TOKEN`. Har man adgang til Docker, har man i praksis adgang til alle *secrets* i containerne. Derfor bruger rigtige systemer en secrets manager (Del 5), og derfor er det vigtigt, hvem der har adgang til serveren.

---

## 3b · Kræv et token for at ændre noter

### Hvad er gjort

| Fil | Ændring |
|-----|---------|
| `backend/src/presentation/auth.js` (ny) | `isAuthorized(req)`: læser `Authorization: Bearer <token>` og sammenligner med `process.env.NOTES_API_TOKEN` |
| `backend/src/presentation/server.js` (linje 7) | `require("./auth")` |
| `backend/src/presentation/server.js` (linje 63–67) | Før routingen: `POST`, `PUT` og `DELETE` uden gyldigt token får `401` og headeren `WWW-Authenticate: Bearer` |
| `backend/src/presentation/server.js` (linje 11, 20–21) | `send()` kan få ekstra headers. CORS tillader nu headeren `Authorization`, så en browser må sende tokenet |
| `spec/swagger.json` | `components.securitySchemes.bearerAuth` (`type: http`, `scheme: bearer`), `security: [{ bearerAuth: [] }]` på `POST`, `PUT` og `DELETE`, et fælles `401`-svar i `components.responses.Unauthorized`, og version `1.2.0` |

`GET /v1/notes`, `GET /v1/notes/{id}` og `GET /v1/notes/search` er uændrede og åbne for alle.

### Valg i koden, og hvorfor

- **Tjekket ligger i presentation-laget** (`auth.js` ved siden af `server.js`). Det handler om HTTP, headers og statuskoder, ikke om regler for noter. `notesService.js` og persistence-laget er uændrede.
- **Tjekket sker før routingen.** Så kan ingen route glemme det. Ulempen er, at `POST` til en sti, der ikke findes, giver `401` og ikke `404`. Det afslører til gengæld ikke, hvilke stier der findes.
- **"Fail closed":** Er `NOTES_API_TOKEN` ikke sat, bliver **alle** `POST`, `PUT` og `DELETE` afvist, og backend skriver en advarsel i loggen. Det modsatte, at alt er åbent, når tokenet mangler, ville være en farlig fejl at opdage for sent.
- **Sammenligning med `crypto.timingSafeEqual`** i stedet for `===`. `===` stopper ved første forkerte tegn, så en angriber i teorien kan gætte tokenet ét tegn ad gangen ved at måle svartiden. Begge tokens hashes først med SHA-256, så de altid har samme længde, som `timingSafeEqual` kræver.
- **`WWW-Authenticate: Bearer`** på `401` er HTTP-standarden for at fortælle klienten, *hvordan* den skal logge ind.

### Test

Kørt med `docker compose up` og rigtig MongoDB og Qdrant. Ollama var erstattet af en lille fake, der svarer med 1024 tal:

| Request | Svar |
|---------|------|
| `GET /v1/notes` | `200` |
| `GET /v1/notes/search?q=kaffe` | `200` |
| `DELETE /v1/notes/1` uden token | `401` |
| `DELETE /v1/notes/1` med forkert token | `401` |
| `DELETE /v1/notes/1` med token | `204` |
| `POST /v1/notes` uden / med token | `401` / `201` |
| `PUT /v1/notes/2` uden / med token | `401` / `200` |
| `OPTIONS /v1/notes` (CORS preflight) | `204`, `Access-Control-Allow-Headers: Content-Type, Authorization` |
| `docker compose config` uden `.env` | Stopper med "required variable MONGO_PASSWORD is missing a value" |

**Færdig betyder** er opfyldt: `DELETE /v1/notes/1` uden token giver `401`, og med token virker det.

---

## 3c · Og frontend?

Der er **ikke** ændret i frontend. Den nuværende frontend læser og søger kun (`GET`), så den virker uden token.

**Svar på spørgsmålet:** Lægger man `NOTES_API_TOKEN` i `app.js`, kan alle, der åbner siden, læse det med **Vis kilde** eller i DevTools → Sources. HTTPS hjælper ikke, for det beskytter kun tokenet på vej over netværket, og her sender serveren det selv til alle. Et fælles token i frontend er det samme som intet token.

Løsningen er, at **brugeren** logger ind og får sin egen adgang, som backend udsteder, kan lade udløbe og kan tilbagekalde:

- **Login med en `HttpOnly`-session-cookie.** Se den sammenfoldede **Løsning** under 3c i [session 20's README](../README.md#3c--og-frontend), med kode.
- **Et kortlivet token pr. bruger** efter login, som `app.js` kun holder i hukommelsen og sender som `Authorization: Bearer …`. Det er OK over HTTPS, men et ondsindet script på siden (XSS) kan læse det.
- **"Log ind med GitHub"** (OAuth, Del 5). Så skal I slet ikke gemme passwords.

`NOTES_API_TOKEN` fra 3b er et **maskine-til-maskine-token**: til Insomnia, `curl` og andre services, ikke til browsere.
