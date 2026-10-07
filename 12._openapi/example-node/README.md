# Notes-service med OpenAPI: eksempel til session 12

Sådan kan Del 1 i [session 12](../README.md) se ud, når den er løst: notes-servicen med en kontrakt, der beskriver den. Eksemplet bygger på [`09._Layered_architecture_hands_on/example-node`](../../09._Layered_architecture_hands_on/example-node), men tre ting er anderledes:

- **Kun backend og MongoDB.** Frontend og MySQL er taget ud, så al opmærksomhed går til kontrakten.
- **En kontrakt.** `spec/swagger.json` er en OpenAPI 3-specifikation, der beskriver præcis det, API'et gør.
- **Swagger UI.** Det kører som en service i `docker-compose.yml`, så kontrakten kan læses og afprøves i browseren.

## Kør det

```bash
docker compose up --build
```

| Hvad | Hvor |
|------|------|
| API'et | <http://localhost:3000/v1/notes> |
| Swagger UI | <http://localhost:8081> |

Stop med `Ctrl-C`, og ryd op med `docker compose down`.

## Filerne

```
example-node/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── presentation/
│       │   └── server.js                  ← /v1 i stien, PUT/DELETE, fejlkoder, CORS
│       └── persistence/
│           ├── notesMongoDBRepository.js  ← den der bruges
│           ├── notesRepository.js         ← hardcoded, til udvikling
│           └── notesAPIRepository.js      ← jsonplaceholder
├── spec/
│   └── swagger.json                       ← kontrakten
└── docker-compose.yml                     ← backend + mongo + swagger-ui
```

## Sådan opfylder eksemplet opgaven

Opgaven stiller fire krav. Sådan er de løst i `swagger.json`:

| Krav | I `swagger.json` |
|------|------------------|
| Alle endpoints med metoder og felter | `GET` og `POST /v1/notes` samt `GET`, `PUT` og `DELETE /v1/notes/{id}`. Felterne er samlet i `components.schemas` som `Note`, `NewNote` og `Error`. |
| Mindst ét fejlsvar pr. endpoint | Se tabellen over fejlkoder nedenfor. De fejlsvar, der går igen, ligger i `components.responses`, så hvert endpoint kun henviser til dem. |
| Version i stien | `/v1/notes`. Koden er rettet til, så den gamle `/notes` nu giver `404`. |
| `servers`-linje | `"servers": [{ "url": "http://localhost:3000" }]` |

### Fejlkoderne

| Kode | Hvornår | Endpoints |
|------|---------|-----------|
| `400` | Ugyldig JSON, `title`/`body` mangler, eller id'et er ikke et positivt heltal (`/v1/notes/abc`) | `POST`, `PUT`, og alle på `{id}` |
| `404` | Der findes ingen note med det id | `GET`, `PUT`, `DELETE` på `{id}` |
| `405` | Stien findes, men ikke med den metode (fx `PATCH /v1/notes/1`). Svaret har en `Allow`-header. | Alle stier |
| `415` | `Content-Type` er ikke `application/json` | `POST`, `PUT` |
| `500` | Databasen svarer ikke, eller noget andet uventet | Alle |

`DELETE` svarer `204 No Content` uden body, når noten er slettet. `405` står ikke i `swagger.json`: OpenAPI beskriver de operationer, der findes, ikke dem der ikke gør.

## Hvad er ændret i koden, og hvorfor

En kontrakt er kun noget værd, hvis den passer med virkeligheden. Derfor er `server.js` ændret i forhold til session 9:

1. **`/v1` i stien.** Skal koden ændres? Ja, ellers lover kontrakten noget, API'et ikke gør.
2. **`500` i stedet for et crash.** Uden `try/catch` kan en databasefejl lukke hele Node-processen, så klienten slet ikke får et svar. Nu svarer serveren `500 {"error":"Internal server error"}`, og det kan specifikationen beskrive.
3. **CORS-preflight (`OPTIONS`).** "Try it out" i Swagger UI kører i browseren på `localhost:8081` og kalder `localhost:3000`, en anden origin. Før en `POST`, `PUT` eller `DELETE` sender browseren derfor først en `OPTIONS`-forespørgsel. Uden et svar på den virker `GET`, men resten fejler. Det er værd at tage op i timen: kontrakten kan være helt korrekt, og alligevel kan værktøjet ikke kalde API'et.
4. **`PUT` og `DELETE`.** Begge ligger på `/v1/notes/{id}`. `PUT` erstatter hele noten og kræver derfor både `title` og `body`, ligesom `POST`. Persistence-laget har fået to nye funktioner, `update` og `remove`, i alle tre repositories, så de stadig kan byttes ud med hinanden.
5. **Flere fejlkoder.** `400` for et id, der ikke er et tal, i stedet for `404`. `415` for en forkert `Content-Type`. `405` for en metode, stien ikke understøtter. Se tabellen ovenfor.

## Gode steder at stoppe op i timen

- **Lav en fejl med vilje.** Fjern `400`-svaret fra `POST` i `swagger.json`, eller omdøb `title` til `name`, og genindlæs Swagger UI. Ser det stadig rigtigt ud? Hvem opdager fejlen?
- **Swagger UI kender kun specifikationen, ikke koden.** Prøv "Try it out" på `GET /v1/notes/999`. Svaret er `404`, fordi serveren svarer det, ikke fordi det står i specifikationen.
- **Import i Insomnia.** Importér `spec/swagger.json`, så står alle tre requests klar. Det gør det andet par under "Byt og tjek".
- **Lint specifikationen.** `npx @redocly/cli lint spec/swagger.json` klager over, at der ikke er defineret nogen `security`. Det er korrekt, for API'et har intet login. En god overgang til sikkerhed i session 20.

## Bevidst udeladt

- **`PATCH`.** `PUT` erstatter hele noten. Delvis opdatering er ikke med, så `PATCH` giver `405`.
- **Login og sikkerhed.** Det kommer i session 20.
- **Specifikation genereret fra koden.** `swagger.json` er skrevet i hånden med AI til første udkast, ligesom de studerende gør.
