# Session 20: Sikkerhedsarkitektur · Hvor ligger jeres *secrets*?

**ITA Software Architecture 2026 Fall**

> I har brugt *secrets* hele semestret: en API-nøgle til Mistral Vibe i session 1, et GitHub-token i session 2, 3 og 10, og passwords til databaser i Docker. I dag samler vi trådene. Hvad er et token egentlig, hvor må en *secret* ligge, og hvad gør I, når én er lækket?
>
> Og så giver I jeres notes-service sin egen nøgle.

---

## Dagens spørgsmål

**Jeres notes-service virker. Hvem kan slette alle jeres noter lige nu?**

---

## Læringsmål

Efter i dag kan du:

- skelne mellem **authentication** (*hvem er du?*) og **authorization** (*hvad må du?*), og se forskellen på `401` og `403`
- forklare, hvad et **token** er, og hvorfor det har **scopes** og en **udløbsdato**
- placere en *secret* rigtigt: i en miljøvariabel eller en `.env`-fil, der ikke kommer i Git, og aldrig i kode, images eller frontend
- handle rigtigt, når en *secret* er lækket: **tilbagekald den først**, ryd op bagefter

---

## Før timen

- Hav jeres **notes-service** klar og kørende (`docker compose up`).
  - Virker jeres ikke, eller vil I starte forfra, så brug [`example-node`](example-node/README.md) i denne mappe. Det er notes-servicen med semantisk søgning fra session 19. Kopiér den ind i jeres repo, og kør den derfra.
- Hav **Insomnia** klar.
- Find jeres **GitHub-token** fra session 10 (eller lav et nyt med læseadgang: `public_repo`, `read:user`).

---

## Del 1: Jagt på *secrets*

Find de *secrets*, I har brugt i semestret, og skriv ned, *hvor* de ligger, og *hvem* der kan læse dem:

| Hvor I brugte den | Hvor den sandsynligvis ligger | Prøv | Sådan sletter I den |
|-------------------|-------------------------------|------|---------------------|
| Mistral Vibe-nøglen, session 1 | I styresystemets **nøglering** | **Mac:** `security find-generic-password -s ai.mistral.vibe`<br>**Windows:** Åbn **Legitimationsstyring** (Credential Manager) → *Windows-legitimationsoplysninger* | **Mac:** `security delete-generic-password -s ai.mistral.vibe`<br>**Windows:** Legitimationsstyring → vælg nøglen → **Fjern**<br>Slet også linjen i `~/.vibe/.env`, hvis den findes.<br>**Tilbagekald:** <https://console.mistral.ai> → *API Keys* → slet nøglen |
| GitHub-token til `git push` fra jeres laptop, session 5 og frem | I **nøgleringen**. Git gemmer det selv der | `git config credential.helper` viser hvordan.<br>**Mac:** `security find-internet-password -s github.com`<br>**Windows:** Legitimationsstyring, find `git:https://github.com` | **Mac:** `security delete-internet-password -s github.com`<br>**Windows:** Legitimationsstyring → `git:https://github.com` → **Fjern**<br>**Tilbagekald:** GitHub → *Settings* → *Developer settings* → *Personal access tokens* → **Delete** |
| GitHub-token til `git push` i webtop, session 2 | Som **almindelig tekst** i `~/.git-credentials` i webtop-containeren, fordi I kørte `credential.helper store` | `cat ~/.git-credentials` (i webtop) | `rm ~/.git-credentials`<br>`git config --global --unset credential.helper`<br>**Tilbagekald** tokenet på GitHub som ovenfor |
| `export TOKEN=…` og `export GH_TOKEN=…`, session 3 og 10 | I jeres **shell-historik** | `history \| grep TOKEN` | `history -d <nummer>` for hver linje (start med det højeste nummer), så `history -w`<br>Eller ryd det hele: `history -c && history -w`<br>**Mac (zsh):** Ret i `~/.zsh_history` i en editor<br>`unset TOKEN GH_TOKEN` fjerner dem fra den åbne terminal |
| Databasepasswordet i jeres notes-service, session 9 (`DB_PASSWORD` og `MYSQL_ROOT_PASSWORD`). Det samme gælder session 6 og 18 | I jeres **`docker-compose.yml`** | Kig i filen. I lagde notes-service på GitHub i session 11. Ligger passwordet der nu? | Flyt det ud i en `.env`-fil (Del 3a), og **skift passwordet**. Ligger det på GitHub, er det i historikken, selvom I sletter det i en ny commit (Del 4) |

Kommandoerne til Mac og Windows viser kun, *at* der ligger en nøgle, og ikke selve nøglen. Finder I ikke noget dér, så kig i `~/.vibe/.env`. Ældre versioner af Vibe gemte nøglen i den fil.

At slette en *secret* på jeres egen computer gør den ikke ugyldig. Har en anden fået fat i den, virker den stadig. Det er kun **tilbagekald** hos udbyderen (Mistral, GitHub), der gør den ubrugelig. Mere om det i [Del 4](#del-4-lækket).

Spørgsmål til bagefter:

- Hvilke af jeres *secrets* ligger som **almindelig tekst** i en fil?
- Ligger nogen af dem på **GitHub**?
- Hvilken af dem ville gøre mest skade, hvis en anden fik den?

---

## Del 2: Hvem er du, og hvad må du?

Demo og øvelse i Insomnia mod GitHubs API, som I kender fra session 3 og 10.

1. `POST https://api.github.com/user/repos` med `{ "name": "s20-test", "private": true }` **uden** token. Hvilken statuskode?
2. Samme request **med** jeres læse-token fra session 10 (`Authorization: Bearer …`). Hvilken statuskode nu?
3. `GET https://api.github.com/user` med det samme token. Virker det?

Forskellen på authentication og authorization:

- **Authentication:** GitHub ved ikke, hvem I er → `401 Unauthorized`.
- **Authorization:** GitHub ved godt, hvem I er, men tokenet må ikke det, I beder om. Hvilken kode fik I? Står der noget om scopes i headers (`x-oauth-scopes`, `x-accepted-oauth-scopes`)?

Et token viser, hvem I er (authentication), men det er først og fremmest et **adgangskort** (authorization): Det må kun det, dets scopes tillader. Det har:

- **scopes**: hvad det må (læse, skrive, slette)
- **en udløbsdato**: hvor længe det virker
- **en ejer**: alt, hvad tokenet gør, ser ud som om, *I* gjorde det

Hvorfor gav vi tokenet i session 10 kun læseadgang? Det kaldes **least privilege**: giv kun den adgang, der skal bruges.

---

## Del 3: Øvelse · Giv notes-service en nøgle

I jeres notes-service.

### 3a · *Secrets* ud af compose-filen

Står der et password direkte i `docker-compose.yml`? I `example-node` står MongoDB-passwordet `notes123` to steder: hos `mongo` og i backends `MONGO_URL`. Flyt det ud:

1. Lav en fil `.env` ved siden af `docker-compose.yml`:

   ```
   MONGO_PASSWORD=et-langt-password
   NOTES_API_TOKEN=et-langt-tilfældigt-token
   ```

   Brug fx `openssl rand -hex 32` til at lave et tilfældigt password og token. Hex er kun bogstaver og tal, så det kan stå i en URL uden problemer.
2. I `docker-compose.yml` henter I værdierne fra `.env`:

   ```yaml
     backend:
       environment:
         MONGO_URL: mongodb://notes:${MONGO_PASSWORD}@mongo:27017
         NOTES_API_TOKEN: ${NOTES_API_TOKEN}

     mongo:
       environment:
         MONGO_INITDB_ROOT_USERNAME: notes
         MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
   ```

   MongoDB sætter kun passwordet, første gang containeren starter med en tom database. Kør `docker compose down` og så `docker compose up -d`, så `mongo` starter forfra med det nye password.

3. Tilføj `.env` til `.gitignore`. Lav en `.env.example` med navnene, men uden værdier, og commit den i stedet.
4. Tjek med `git status`, at `.env` **ikke** kommer med.

Prøv `docker compose config`. Hvad viser den? Hvad betyder det, at en *secret* i en miljøvariabel stadig kan læses af alle, der kan køre kommandoer på maskinen?

### 3b · Kræv et token for at ændre noter

- `GET`-requests er stadig åbne for alle.
- `POST`, `PUT` og `DELETE` kræver headeren `Authorization: Bearer <token>`. Mangler den, eller er den forkert, svarer API'et `401`.
- Backend læser tokenet fra miljøvariablen `NOTES_API_TOKEN` (`process.env.NOTES_API_TOKEN`), ikke fra koden. Send den videre fra `.env` i `docker-compose.yml`.
- Tilføj et `securitySchemes`-afsnit med bearer-token i jeres `swagger.json` fra session 12, så kontrakten fortæller klienten, at der kræves et token.

  ```json
  {
    "openapi": "3.0.3",
    "components": {
      "securitySchemes": {
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer"
        }
      }
    },
    "paths": {
      "/v1/notes/{id}": {
        "get": {
          "summary": "Hent én note (åben for alle)",
          "responses": {
            "200": { "description": "Noten" }
          }
        },
        "delete": {
          "summary": "Slet en note",
          "security": [{ "bearerAuth": [] }],
          "responses": {
            "204": { "description": "Noten er slettet" },
            "401": { "description": "Mangler eller forkert token" }
          }
        }
      }
    }
  }
  ```

  `securitySchemes` beskriver, *hvordan* klienten sender tokenet. `security` på den enkelte operation siger, *hvor* det kræves. `GET` har ingen `security` og er derfor åben. I Swagger UI dukker der nu en **Authorize**-knap op, hvor I kan indsætte tokenet.

**Færdig betyder:** I Insomnia giver `DELETE /v1/notes/1` uden token `401`, og med token virker det.

### 3c · Og frontend?

Jeres frontend skal også kunne oprette noter. Hvis I lægger tokenet i `app.js`, hvem kan så se det? Åbn frontend i browseren, og tryk **Vis kilde** (eller kig i DevTools → Sources).

**Frontend kan ikke holde på en _secret_.** Alt, hvad der sendes til browseren, kan brugeren læse. Hvad skulle der til i stedet? (Tænk på, hvordan I logger ind på GitHub.)

<details>
<summary><strong>Løsning:</strong> Login med en session-cookie</summary>

<br>

Browseren skal ikke have en fælles *secret*. I stedet logger **brugeren** ind, og backend giver hver bruger sin egen session, som kan udløbe og slettes.

1. Frontend sender brugernavn og password til `POST /v1/login`.
2. Backend tjekker passwordet mod en **hash** i MongoDB. Passwordet selv bliver aldrig gemt.
3. Er det rigtigt, laver backend et tilfældigt session-id, husker hvem det hører til, og sender det tilbage som en cookie:

   ```
   Set-Cookie: session=4f9c…; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
   ```

   | Flag | Hvad det gør |
   |---|---|
   | `HttpOnly` | JavaScript kan ikke læse cookien. Den står ikke i `app.js` og kan ikke stjæles af et script |
   | `Secure` | Cookien sendes kun over HTTPS (browsere tillader `localhost` uden HTTPS) |
   | `SameSite=Strict` | Cookien sendes ikke med, når en anden hjemmeside laver requests til jeres API |
   | `Max-Age=3600` | Sessionen udløber efter en time |

4. Browseren sender cookien med automatisk. Ved `POST`, `PUT` og `DELETE` slår backend session-id'et op: Hvem er brugeren (authentication), og må brugeren det her (authorization)? Ellers `401`.
5. `POST /v1/logout` sletter sessionen i backend.

**Backend** (Node har det hele indbygget i `crypto`, så der er ingen nye npm-pakker):

```js
const crypto = require("crypto");

// Gem aldrig passwordet, kun salt + hash. Det her kører, når en bruger oprettes.
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

const sessions = new Map(); // session-id → { username, expires }

function createSession(username) {
  const id = crypto.randomBytes(32).toString("hex");
  sessions.set(id, { username, expires: Date.now() + 60 * 60 * 1000 });
  return id;
}

function userFromRequest(req) {
  const match = (req.headers.cookie || "").match(/(?:^|;\s*)session=([a-f0-9]+)/);
  const session = match && sessions.get(match[1]);
  if (!session || session.expires < Date.now()) return null;
  return session.username;
}
```

**Frontend og backend ligger på hver sin origin** (`localhost:8080` og `localhost:3000`), så browseren sender kun cookien med, hvis begge sider siger ja:

```js
// app.js
fetch(`${BACKEND_URL}/v1/notes`, {
  method: "POST",
  credentials: "include", // send cookien med
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, body }),
});
```

```js
// server.js, i send(): ikke "*", når der er cookies med
"Access-Control-Allow-Origin": "http://localhost:8080",
"Access-Control-Allow-Credentials": "true",
```

**Hvor hører det hjemme i lagene?** Login-routen og tjekket af cookien ligger i **presentation** (`server.js`). Reglen "kun ejeren må slette sin note" er en regel for applikationen og hører til i **application** (`notesService.js`). Brugerne med deres password-hash ligger i **persistence**, fx en `usersRepository.js` mod MongoDB.

**Trade-offs:**

- `sessions` ligger i hukommelsen, så alle bliver logget ud, når backend genstarter, og det virker ikke med flere backend-containere. Rigtige systemer gemmer sessionerne i en database eller i Redis.
- Det her er stadig jeres egen login. Med **"Log ind med GitHub"** (OAuth, Del 5) skal I slet ikke gemme passwords. Til gengæld skal I oprette en OAuth-app på GitHub og holde dens `client_secret` i backends `.env`.

</details>

---

## Del 4: Lækket!

**Scenarie:** I opdager, at jeres `NOTES_API_TOKEN` har ligget i et offentligt GitHub-repo i to dage.

**Prøv det selv med et falsk token** i et nyt, tomt test-repo (aldrig med et rigtigt token):

1. Lav en fil `config.js` med `const TOKEN = "falsk-token-123";`. Commit og push.
2. Fjern linjen i en ny commit, og push igen.
3. Kør `git log -p`. Er tokenet væk?

Sæt de her skridt i den rigtige rækkefølge, og begrund:

- Fjern tokenet fra Git-historikken
- **Tilbagekald tokenet**, og lav et nyt
- Find ud af, om tokenet er blevet brugt
- Sørg for, at det ikke sker igen (`.gitignore`, `.env.example`)
- Fortæl det til dem, det går ud over

Hvorfor er det ikke nok at slette tokenet fra repoet? Bots scanner offentlige repos for nøgler inden for få minutter, og forks og kloner har stadig historikken.

> **GitHub hjælper.** Gå til jeres repo, og vælg **Settings → Advanced Security** (under *Security and quality* i menuen til venstre). Nederst på siden står **Secret Protection**. Tryk **Enable**.
>
> - Så holder GitHub hele tiden øje med repoet og giver jer besked, hvis der ligger *secrets* i det.
> - Når Secret Protection er slået til, kan I også slå **push protection** til. Den stopper et push, der indeholder en kendt slags token, *før* det lander på GitHub.
> - Er repoet offentligt, giver GitHub altid selv besked til udbyderen af tokenet, fx AWS eller OpenAI, når den finder et token. Hvad tror I, udbyderen gør så?

**Ligger jeres GitHub-token måske som almindelig tekst?** I session 2 kørte I `git config --global credential.helper store`. Hvis I stadig bruger den indstilling, *kan* jeres token ligge i filen `~/.git-credentials`, som alle med adgang til jeres bruger kan læse. Men det er ikke givet, at den ligger der: Mange gemmer i stedet tokenet i styresystemets nøglering, fx Keychain på Mac. Tjek det, både på jeres laptop og i webtop-containeren fra session 2:

```bash
git config --global credential.helper   # står der "store"?
ls ~/.git-credentials                   # findes filen?
```

Står der `store`, eller findes filen, så skift til en sikrere løsning, og slet filen:

```bash
git config --global credential.helper osxkeychain   # Mac: Keychain
git config --global credential.helper manager       # Windows: Legitimationsstyring
git config --global credential.helper cache         # webtop/Linux: husker kun tokenet i 15 minutter
rm ~/.git-credentials
```

Tilbagekald derefter det gamle token, og lav et nyt.

---

## Del 5: Sådan gør de andre

- **_Secrets_ i rigtige systemer** ligger i en **secrets manager**: GitHub Actions Secrets, HashiCorp Vault, 1Password, eller cloud-udbyderens (AWS Secrets Manager, Azure Key Vault). Koden får dem, når den kører, og de ligger aldrig i Git.
- **Kortlivede tokens:** Jo kortere et token virker, jo mindre skade gør det, hvis det lækker. Det er derfor, GitHub beder jer om en udløbsdato.
- **"Log ind med GitHub/Google"** (OAuth): Brugeren giver en app et token *på sine vegne*, med bestemte scopes, uden at give appen sit password. Det er svaret på 3c.
- **HTTPS:** Et token, der sendes over `http://`, kan læses af alle på netværket. Et bearer-token beskytter kun, hvis forbindelsen er krypteret.

---

## Del 6: Øvelse · Tjek jeres obligatoriske opgave

Nu skal I bruge det på noget, der allerede er afleveret. Åbn jeres gruppes repo med den obligatoriske opgave, som I afleverede i sidste uge, og find alle de *secrets*, der står som almindelig tekst.

### 6a · Find dem

Klon repoet på ny, så I tjekker præcis det, der ligger på GitHub, og ikke jeres lokale kopi:

```bash
git clone <url-til-jeres-repo> tjek-aflevering
cd tjek-aflevering
```

**I filerne, som de ser ud nu:**

```bash
git grep -n -i -E "password|passwd|secret|token|api[_-]?key|bearer"
git grep -n -E "ghp_|github_pat_"            # GitHub-tokens
git grep -n -E "://[^/@ ]+:[^/@ ]+@"         # URL med brugernavn og password
ls -a                                         # ligger der en .env?
cat .gitignore                                # står .env der?
```

**I historikken.** En *secret*, der er slettet i en senere commit, ligger der stadig (Del 4):

```bash
git log -p --all | grep -n -i -E "password|token|api[_-]?key|bearer|ghp_"
git log --all --oneline -- .env               # har .env nogensinde været committet?
```

Kig især i `docker-compose.yml` (`environment:`), `Dockerfile` (`ENV` og `ARG`), jeres shell-scripts (`curl -H "Authorization: …"`) og `README.md` (eksempler med rigtige værdier).

Slå også **Secret Protection** til på repoet, som i Del 4, og se, om GitHub finder noget, I har overset.

Skriv en liste: *Hvad* er det, *hvor* ligger det (fil og commit), og er det **rigtigt** (virker det et sted), eller er det bare et eksempel?

### 6b · Løs dem

For hver *secret* på listen, i den rækkefølge I fandt frem til i Del 4:

1. **Er den rigtig, så tilbagekald den først**, og lav en ny. Et token på GitHub i flere uger skal regnes for lækket.
2. **Flyt den ud af koden** til en `.env`-fil, som i Del 3a. Scriptet læser den som miljøvariabel, fx `curl -H "Authorization: Bearer $API_TOKEN" …`, og `docker-compose.yml` sender den videre med `${API_TOKEN}`.
3. **Tilføj `.env` til `.gitignore`**, og commit en `.env.example` med navnene, men uden værdier.
4. **Opdatér `README.md`**, så en fremmed kan se, hvilke værdier de selv skal udfylde, før `docker compose up` virker.
5. **Commit og push**, og kør tjekket fra 6a igen.

**Færdig betyder:** `git grep` finder ingen rigtige *secrets*, `.env` er ikke i repoet, og projektet kan stadig startes ud fra README'en.

> **Miniøvelse:** Fandt I ingen *secrets*? Så kig efter det, der *kunne* blive et problem: et password, der står hardcodet "bare til test", en `ENV` i `Dockerfile`, eller en URL med brugernavn og password i. Hvad ville der ske, hvis I en dag skiftede den ud med en rigtig værdi?

Spørgsmål til bagefter:

- Hvor mange af de *secrets*, I fandt, var stadig gyldige?
- Hvilken af dem kunne I ikke fjerne ved bare at lave en ny commit? Hvad gjorde I i stedet?

---

Tilbage til dagens spørgsmål: **Hvem kan slette alle jeres noter nu?**

---

## Optional

- [optional] GitHub Docs: [Keeping your personal access tokens secure](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [optional] GitHub Docs: [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [optional] OWASP: [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [optional] OWASP Top 10 (nyeste udgave). Bare kategorinavnene.
