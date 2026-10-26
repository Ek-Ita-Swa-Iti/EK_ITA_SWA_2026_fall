# Session 20: Sikkerhedsarkitektur · Hvor ligger jeres hemmeligheder?

**ITA Software Architecture 2026 Fall**

> I har brugt hemmeligheder hele semestret: en API-nøgle til Mistral Vibe i session 1, et GitHub-token i session 2, 3 og 10, og passwords til databaser i Docker. I dag samler vi trådene. Hvad er et token egentlig, hvor må en hemmelighed ligge, og hvad gør I, når én er lækket?
>
> Og så giver I jeres notes-service sin egen nøgle.

---

## Dagens spørgsmål

**Jeres notes-service virker. Hvem kan slette alle jeres noter lige nu?**

---

## Læringsmål

Efter i dag kan du:

- skelne mellem **autentificering** (*hvem er du?*) og **autorisation** (*hvad må du?*), og se forskellen på `401` og `403`
- forklare, hvad et **token** er, og hvorfor det har **scopes** og en **udløbsdato**
- placere en hemmelighed rigtigt: i en miljøvariabel eller en `.env`-fil, der ikke kommer i Git, og aldrig i kode, images eller frontend
- handle rigtigt, når en hemmelighed er lækket: **tilbagekald den først**, ryd op bagefter

---

## Før timen

- Hav jeres **notes-service** klar og kørende (`docker compose up`).
- Hav **Insomnia** og jeres AI-agent klar.
- Find jeres **GitHub-token** fra session 10 (eller lav et nyt med læseadgang: `public_repo`, `read:user`).

---

## Del 1: Hemmelighedsjagt (20 min)

Alene, på jeres egen computer. **Vis ikke jeres skærm til andre i denne del.**

Find de hemmeligheder, I har brugt i semestret, og skriv ned, *hvor* de ligger, og *hvem* der kan læse dem:

| Hvor I brugte den | Prøv |
|-------------------|------|
| Mistral Vibe, session 1 | `cat ~/.vibe/.env` |
| `git push` med token, session 2 | `cat ~/.git-credentials` (hvis I brugte `credential.helper store`) |
| `export TOKEN=…`, session 3 og 10 | `history \| grep TOKEN` |
| Databasepasswords i Docker, session 6 og 18 | Kig i jeres `docker-compose.yml`. Ligger den på GitHub? |

Spørgsmål til bagefter, i par:

- Hvilke af jeres hemmeligheder ligger som **almindelig tekst** i en fil?
- Ligger nogen af dem på **GitHub**?
- Hvilken af dem ville gøre mest skade, hvis en anden fik den?

---

## Del 2: Hvem er du, og hvad må du? (25 min)

Demo og øvelse i Insomnia mod GitHubs API, som I kender fra session 3 og 10.

1. `POST https://api.github.com/user/repos` med `{ "name": "s20-test", "private": true }` **uden** token. Hvilken statuskode?
2. Samme request **med** jeres læse-token fra session 10 (`Authorization: Bearer …`). Hvilken statuskode nu?
3. `GET https://api.github.com/user` med det samme token. Virker det?

Forklar forskellen:

- **Autentificering:** GitHub ved ikke, hvem I er → `401 Unauthorized`.
- **Autorisation:** GitHub ved godt, hvem I er, men tokenet må ikke det, I beder om. Hvilken kode fik I? Står der noget om scopes i headers (`x-oauth-scopes`, `x-accepted-oauth-scopes`)?

Et token er et **adgangskort**, ikke en identitet. Det har:

- **scopes**: hvad det må (læse, skrive, slette)
- **en udløbsdato**: hvor længe det virker
- **en ejer**: alt, hvad tokenet gør, ser ud som om, *I* gjorde det

Hvorfor gav vi tokenet i session 10 kun læseadgang? Det kaldes **least privilege**: giv kun den adgang, der skal bruges.

---

## Del 3: Øvelse · Giv notes-service en nøgle (45 min)

I par, i jeres notes-service. I må bruge agenten.

### 3a · Hemmeligheder ud af compose-filen

Står der et password direkte i `docker-compose.yml` (fx `POSTGRES_PASSWORD: postgres`)? Flyt det ud:

1. Lav en fil `.env` ved siden af `docker-compose.yml`:

   ```
   POSTGRES_PASSWORD=et-langt-password
   NOTES_API_TOKEN=et-langt-tilfældigt-token
   ```

   Brug fx `openssl rand -hex 32` til at lave et tilfældigt token.
2. I `docker-compose.yml` henter I værdierne fra `.env`:

   ```yaml
       environment:
         POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
   ```

3. Tilføj `.env` til `.gitignore`. Lav en `.env.example` med navnene, men uden værdier, og commit den i stedet.
4. Tjek med `git status`, at `.env` **ikke** kommer med.

Prøv `docker compose config`. Hvad viser den? Hvad betyder det, at en hemmelighed i en miljøvariabel stadig kan læses af alle, der kan køre kommandoer på maskinen?

### 3b · Kræv et token for at ændre noter

- `GET`-requests er stadig åbne for alle.
- `POST`, `PUT` og `DELETE` kræver headeren `Authorization: Bearer <token>`. Mangler den, eller er den forkert, svarer API'et `401`.
- Backend læser tokenet fra miljøvariablen `NOTES_API_TOKEN` (`process.env.NOTES_API_TOKEN`), ikke fra koden. Send den videre fra `.env` i `docker-compose.yml`.
- Tilføj et `securitySchemes`-afsnit med bearer-token i jeres `swagger.json` fra session 12, så kontrakten fortæller klienten, at der kræves et token.

**Færdig betyder:** I Insomnia giver `DELETE /v1/notes/1` uden token `401`, og med token virker det.

### 3c · Og frontend?

Jeres frontend skal også kunne oprette noter. Hvis I lægger tokenet i `app.js`, hvem kan så se det? Åbn frontend i browseren, og tryk **Vis kilde** (eller kig i DevTools → Sources).

**Frontend kan ikke holde på en hemmelighed.** Alt, hvad der sendes til browseren, kan brugeren læse. Hvad skulle der til i stedet? (Tænk på, hvordan I logger ind på GitHub.)

---

## Pause (15 min)

---

## Del 4: Lækket! (30 min)

**Scenarie:** I opdager, at jeres `NOTES_API_TOKEN` har ligget i et offentligt GitHub-repo i to dage.

**Prøv det selv med et falsk token** i et nyt, tomt test-repo (aldrig med et rigtigt token):

1. Lav en fil `config.js` med `const TOKEN = "falsk-token-123";`. Commit og push.
2. Fjern linjen i en ny commit, og push igen.
3. Kør `git log -p`. Er tokenet væk?

I par: Sæt de her skridt i den rigtige rækkefølge, og begrund:

- Fjern tokenet fra Git-historikken
- **Tilbagekald tokenet**, og lav et nyt
- Find ud af, om tokenet er blevet brugt
- Sørg for, at det ikke sker igen (`.gitignore`, `.env.example`)
- Fortæl det til dem, det går ud over

Hvorfor er det ikke nok at slette tokenet fra repoet? Bots scanner offentlige repos for nøgler inden for få minutter, og forks og kloner har stadig historikken.

> GitHub hjælper: **secret scanning** og **push protection** kan stoppe et push, der indeholder en kendt slags token. Se **Settings → Code security** i jeres repo.

---

## Del 5: Sådan gør de andre (15 min)

- **Hemmeligheder i rigtige systemer** ligger i en **secrets manager**: GitHub Actions Secrets, HashiCorp Vault, 1Password, eller cloud-udbyderens (AWS Secrets Manager, Azure Key Vault). Koden får dem, når den kører, og de ligger aldrig i Git.
- **Kortlivede tokens:** Jo kortere et token virker, jo mindre skade gør det, hvis det lækker. Det er derfor, GitHub beder jer om en udløbsdato.
- **"Log ind med GitHub/Google"** (OAuth): Brugeren giver en app et token *på sine vegne*, med bestemte scopes, uden at give appen sit password. Det er svaret på 3c.
- **HTTPS:** Et token, der sendes over `http://`, kan læses af alle på netværket. Et bearer-token beskytter kun, hvis forbindelsen er krypteret.

Tilbage til dagens spørgsmål: **Hvem kan slette alle jeres noter nu?**

---

## Efter timen

- **Ryd op:** På GitHub under **Settings → Developer settings → Personal access tokens**: slet de tokens, I ikke bruger, og tjek udløbsdatoen på resten.
- Brugte I `credential.helper store` i session 2? Så ligger jeres token som almindelig tekst i `~/.git-credentials`. Spørg agenten om `osxkeychain` (Mac) eller `manager` (Windows) i stedet.
- Skriv fem linjer i jeres semesternotesbog: Hvilke hemmeligheder har jeres notes-service nu, hvor ligger de, og hvad gør I, hvis én lækker?

---

## Optional

- [optional] GitHub Docs: [Keeping your personal access tokens secure](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [optional] GitHub Docs: [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [optional] OWASP: [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [optional] OWASP Top 10 (nyeste udgave). Bare kategorinavnene.
