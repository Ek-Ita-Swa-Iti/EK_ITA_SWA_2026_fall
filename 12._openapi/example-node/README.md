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
│       │   └── server.js                  ← /v1 i stien, CORS-preflight, 500-svar
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
| Alle endpoints med metoder og felter | `GET` og `POST /v1/notes` samt `GET /v1/notes/{id}`. Felterne er samlet i `components.schemas` som `Note`, `NewNote` og `Error`. |
| Mindst ét fejlsvar pr. endpoint | `POST` kan give `400` (med to eksempler), `GET {id}` kan give `404`, og alle tre kan give `500`. |
| Version i stien | `/v1/notes`. Koden er rettet til, så den gamle `/notes` nu giver `404`. |
| `servers`-linje | `"servers": [{ "url": "http://localhost:3000" }]` |

## Hvad er ændret i koden, og hvorfor

En kontrakt er kun noget værd, hvis den passer med virkeligheden. Derfor er `server.js` ændret tre steder i forhold til session 9:

1. **`/v1` i stien.** Skal koden ændres? Ja, ellers lover kontrakten noget, API'et ikke gør.
2. **`500` i stedet for et crash.** Uden `try/catch` kan en databasefejl lukke hele Node-processen, så klienten slet ikke får et svar. Nu svarer serveren `500 {"error":"Internal server error"}`, og det kan specifikationen beskrive.
3. **CORS-preflight (`OPTIONS`).** "Try it out" i Swagger UI kører i browseren på `localhost:8081` og kalder `localhost:3000`, en anden origin. Før en `POST` med JSON sender browseren derfor først en `OPTIONS`-forespørgsel. Uden et svar på den virker `GET`, men `POST` fejler. Det er værd at tage op i timen: kontrakten kan være helt korrekt, og alligevel kan værktøjet ikke kalde API'et.

## Gode steder at stoppe op i timen

- **Lav en fejl med vilje.** Fjern `400`-svaret fra `POST` i `swagger.json`, eller omdøb `title` til `name`, og genindlæs Swagger UI. Ser det stadig rigtigt ud? Hvem opdager fejlen?
- **Swagger UI kender kun specifikationen, ikke koden.** Prøv "Try it out" på `GET /v1/notes/999`. Svaret er `404`, fordi serveren svarer det, ikke fordi det står i specifikationen.
- **Import i Insomnia.** Importér `spec/swagger.json`, så står alle tre requests klar. Det gør det andet par under "Byt og tjek".
- **Lint specifikationen.** `npx @redocly/cli lint spec/swagger.json` klager over, at der ikke er defineret nogen `security`. Det er korrekt, for API'et har intet login. En god overgang til sikkerhed i session 20.

## Bevidst udeladt

- **`PUT` og `DELETE`.** Backend'en fra session 9 har dem ikke, og en specifikation må kun beskrive det, der findes.
- **Login og sikkerhed.** Det kommer i session 20.
- **Specifikation genereret fra koden.** `swagger.json` er skrevet i hånden med AI til første udkast, ligesom de studerende gør.
