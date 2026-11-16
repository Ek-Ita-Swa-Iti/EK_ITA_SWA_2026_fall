# Session 20: Sikkerhedsarkitektur · Hvor ligger jeres *secrets*?

**ITA Software Architecture 2026 Fall**

> I har brugt *secrets* hele semestret: API-nøgler, GitHub-tokens og databasepasswords. I dag ser vi, hvor hurtigt en *secret* bliver fundet, når den ligger forkert, og så rydder I op i jeres egen kode.

---

## Eksamensdatoer

4.–5. samt 7.–8. januar

---

## Dagens spørgsmål

**Hvor ligger jeres *secrets*, og hvem kan læse dem lige nu?**

---

## Læringsmål

Efter i dag kan du:

- flytte en *secret* ud af koden og ind i en `.env`-fil, der ikke kommer i Git
- finde *secrets* i et repo, også i Git-historikken
- handle rigtigt, når en *secret* er lækket: **tilbagekald den først**, ryd op bagefter

---

## Før timen

- Hav jeres **notes-service** klar og kørende (`docker compose up`). Virker jeres ikke, så brug [`example-node`](example-node/README.md) i denne mappe.
- Hav **Insomnia** klar.
- Hav linket til jeres gruppes repo med den **obligatoriske opgave**.

---

## Program

1. Runde 1 · Demo: GitHub fanger et token
2. Runde 2 · *Secrets* ud af compose-filen
3. Runde 3 · Skattejagt
4. Runde 4 · Find *secrets* i jeres aflevering
5. Ekstra · Kræv et token for at slette noter
6. Opsamling

---

## Runde 1 · Demo: GitHub fanger et token

Vi laver et rigtigt GitHub-token uden rettigheder, lægger det i en fil i et offentligt repo og kører `git push`.

**Gæt:** Hvad sker der?

Hvis tokenet slipper igennem, scanner både GitHub og bots alle offentlige commits. Så det vigtigste først:

1. **Tilbagekald tokenet**, og lav et nyt
2. Find ud af, om det er blevet brugt
3. Fjern det fra koden, og sørg for, at det ikke sker igen (`.gitignore`, `.env.example`)

At slette det i en ny commit er ikke nok. Det ligger stadig i historikken og i alle kloner.

---

## Runde 2 · *Secrets* ud af compose-filen

**Demo:** Vi gør det i `example-node`.

**I gør det samme** i jeres notes-service:

1. Lav en `.env` ved siden af `docker-compose.yml`:

   ```
   MONGO_PASSWORD=et-langt-password
   ```

   Lav et tilfældigt password med `openssl rand -hex 32`.

2. Brug værdien i `docker-compose.yml` i stedet for passwordet:

   ```yaml
     backend:
       environment:
         MONGO_URL: mongodb://notes:${MONGO_PASSWORD}@mongo:27017

     mongo:
       environment:
         MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
   ```

3. Tilføj `.env` til `.gitignore`. Lav en `.env.example` med `MONGO_PASSWORD=` uden værdi, og commit den.
4. Genstart med `docker compose down` og `docker compose up -d`. MongoDB sætter kun passwordet, når den starter med en tom database.

**Færdig når:** `git status` ikke viser `.env`, og `GET /v1/notes` virker i Insomnia.

**Prøv bagefter:** `docker compose config`. Hvad står der? Hvem kan læse passwordet nu?

---

## Runde 3 · Skattejagt

Sofie har lavet en lille notes-app og gemt **5 *secrets*** i den. Nogle står i filerne, og én er slettet igen, men ligger stadig i historikken. Find dem alle.

```bash
bash skattejagt/lav-repo.sh
cd skattejagt-repo
```

Kør scriptet fra denne mappe (`20._security_architecture`). Det laver repoet med hele historikken.

Brug alt, hvad I vil: jeres editor, `git log -p` og `git show <commit>`. Brug kun AI til at få hjælp til, hvilke Git- og terminalkommandoer I skal bruge, ikke til at lede efter *secrets*.

**Færdig når:** I har alle 5, og for hver kan I sige *hvor* den ligger (fil eller commit), og *hvem* der kan se den. Den første gruppe vinder.

---

## Runde 4 · Find *secrets* i jeres aflevering

**Demo:** Vi kører prompten herunder på et repo.

**I gør det samme** på jeres gruppes repo med den obligatoriske opgave. Klon det på ny, så I tjekker det, der ligger på GitHub:

```bash
git clone <url-til-jeres-repo> tjek-aflevering
cd tjek-aflevering
```

Åbn jeres AI-agent (fx Mistral Vibe eller Claude Code) i mappen, og giv den denne prompt:

```text
Find alle secrets i dette Git-repo: passwords, API-nøgler, tokens og URL'er med
brugernavn og password i. Søg både i filerne nu og i hele Git-historikken
(git log -p --all). Tjek også, om .env står i .gitignore.

Lav en tabel: Hvad, Hvor (fil og linje eller commit), og om den er rigtig eller
bare et eksempel. Skriv aldrig en hel secret ud, kun de første 4 tegn og ****.
Ret ikke noget.
```

Ret det, I finder: Er en *secret* rigtig, så **tilbagekald den først**. Flyt den derefter ud i `.env`, som i Runde 2.

**Færdig når:** I har rettet mindst én ting, eller kan vise, at der ikke var noget.

**Tænk over:** Agenten har lige læst alle jeres *secrets* og sendt dem til en AI-udbyder. Er de så lækket?

---

## Ekstra · Kræv et token for at slette noter

Lige nu kan alle slette jeres noter. Lås `POST`, `PUT` og `DELETE` med et token:

1. Tilføj `NOTES_API_TOKEN=…` til `.env`, og send den videre til backend i `docker-compose.yml`:

   ```yaml
         NOTES_API_TOKEN: ${NOTES_API_TOKEN}
   ```

2. I `server.js`, lige efter `OPTIONS`-tjekket:

   ```js
   const token = process.env.NOTES_API_TOKEN;
   if (["POST", "PUT", "DELETE"].includes(req.method) &&
       (!token || req.headers.authorization !== `Bearer ${token}`)) {
     return send(res, 401, { error: "Missing or invalid token" });
   }
   ```

**Færdig når:** `DELETE /v1/notes/1` i Insomnia giver `401` uden token og virker med headeren `Authorization: Bearer <token>`.

---

## Opsamling

Tilbage til dagens spørgsmål: **Hvor ligger jeres *secrets* nu, og hvem kan læse dem?**

---

## Optional

- [optional] GitHub Docs: [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [optional] OWASP: [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
