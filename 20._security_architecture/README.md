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
   ```

   Brug fx `openssl rand -hex 32` til at lave et tilfældigt password. Hex er kun bogstaver og tal, så det kan stå i en URL uden problemer.
2. I `docker-compose.yml` henter I værdien fra `.env`:

   ```yaml
     backend:
       environment:
         MONGO_URL: mongodb://notes:${MONGO_PASSWORD}@mongo:27017

     mongo:
       environment:
         MONGO_INITDB_ROOT_USERNAME: notes
         MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
   ```

   MongoDB sætter kun passwordet, første gang containeren starter med en tom database. Kør `docker compose down` og så `docker compose up -d`, så `mongo` starter forfra med det nye password.

3. Tilføj `.env` til `.gitignore`. Lav en `.env.example` med navnene, men uden værdier, og commit den i stedet.
4. Tjek med `git status`, at `.env` **ikke** kommer med.

Prøv `docker compose config`. Hvad viser den? Hvad betyder det, at en *secret* i en miljøvariabel stadig kan læses af alle, der kan køre kommandoer på maskinen?

---

## Del 4: Lækket!

**Scenarie:** I opdager, at jeres GitHub-token har ligget i et offentligt GitHub-repo i to dage.

**Prøv det selv med et falsk token** i et nyt, tomt test-repo (aldrig med et rigtigt token):

1. Lav en fil `config.js` med `const TOKEN = "falsk-token-123";`. Commit og push.
2. Fjern linjen i en ny commit, og push igen.
3. Kør `git log -p`. Er tokenet væk?

Sæt de her skridt i den rigtige rækkefølge, og begrund:

- Fjern tokenet fra Git-historikken
- Tilbagekald tokenet, og lav et nyt
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

## Del 5: Øvelse · Tjek jeres obligatoriske opgave

Nu skal I bruge det på noget, der allerede er afleveret. Åbn jeres gruppes repo med den obligatoriske opgave, som I afleverede i sidste uge, og find alle de *secrets*, der står som almindelig tekst.

### 5a · Find dem

Klon repoet på ny, så I tjekker præcis det, der ligger på GitHub, og ikke jeres lokale kopi:

```bash
git clone <url-til-jeres-repo> tjek-aflevering
cd tjek-aflevering
```

Åbn jeres AI-agent (fx Mistral Vibe eller Claude Code) i mappen `tjek-aflevering`, og giv den denne prompt:

```text
Du er sikkerhedsreviewer. Find alle secrets i dette Git-repo: passwords, API-nøgler,
tokens (fx GitHub-tokens, der starter med ghp_ eller github_pat_), private nøgler og
URL'er med brugernavn og password i (fx mongodb://bruger:password@host).

Søg to steder:
1. I filerne, som de ser ud nu. Kig især i docker-compose.yml (environment:),
   Dockerfile (ENV og ARG), .env-filer, shell-scripts (fx curl -H "Authorization: ..."),
   kode, konfigurationsfiler og README.md (eksempler med rigtige værdier).
2. I hele Git-historikken på alle branches (git log -p --all), også secrets, der er
   slettet i en senere commit. Tjek også, om en .env-fil nogensinde har været committet.

Tjek desuden, om der ligger en .env-fil, og om .env står i .gitignore.

Lav en tabel med kolonnerne: Hvad (type af secret), Hvor (fil og linje, eller
commit-hash), Ligger den stadig i filerne nu (ja/nej), og Rigtig eller eksempel
(med en kort begrundelse).

Regler:
- Skriv aldrig en hel secret ud. Vis kun de første 4 tegn efterfulgt af ****.
- Ret, slet eller commit ikke noget. Du skal kun finde og rapportere.
```

Tjek agentens svar: Kig selv i de filer og commits, den peger på. En agent kan både overse noget og finde noget, der ikke er der.

> ⚠️ **Stop op:** Agenten har netop læst jeres kode og hele historikken, og alt, hvad den læser, bliver sendt til AI-udbyderens servere. Har I dermed givet jeres *secrets* til en tredjepart? Hjælper det, at prompten beder agenten om at skjule dem, når den allerede har læst dem? Skal de *secrets*, agenten fandt, regnes for lækket, og hvad skal I så gøre i 5b?

Slå også **Secret Protection** til på repoet, som i Del 4, og se, om GitHub finder noget, I har overset.

Skriv en liste: *Hvad* er det, *hvor* ligger det (fil og commit), og er det **rigtigt** (virker det et sted), eller er det bare et eksempel?

### 5b · Løs dem

For hver *secret* på listen, i den rækkefølge I fandt frem til i Del 4:

1. **Er den rigtig, så tilbagekald den først**, og lav en ny. Et token på GitHub i flere uger skal regnes for lækket.
2. **Flyt den ud af koden** til en `.env`-fil, som i Del 3a. Scriptet læser den som miljøvariabel, fx `curl -H "Authorization: Bearer $API_TOKEN" …`, og `docker-compose.yml` sender den videre med `${API_TOKEN}`.
3. **Tilføj `.env` til `.gitignore`**, og commit en `.env.example` med navnene, men uden værdier.
4. **Opdatér `README.md`**, så en fremmed kan se, hvilke værdier de selv skal udfylde, før `docker compose up` virker.
5. **Commit og push**, og kør prompten fra 5a igen i en ny klon.

**Færdig betyder:** Agenten finder ingen rigtige *secrets* i filerne, `.env` er ikke i repoet, og projektet kan stadig startes ud fra README'en.

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
