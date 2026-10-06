# Notes-service med OpenAPI: eksempel til session 12

Et færdigt eksempel på det, de studerende laver i [session 12](../README.md), Del 1 som API-ejere. Udgangspunktet er [`09._Layered_architecture_hands_on/example-node`](../../09._Layered_architecture_hands_on/example-node) med tre ændringer:

- **Kun backend og MongoDB.** Frontend og MySQL er fjernet, så der ikke er noget, der stjæler opmærksomheden fra kontrakten.
- **En kontrakt:** `spec/swagger.json`, en OpenAPI 3-specifikation, der beskriver præcis det, API'et gør.
- **Swagger UI** som service i `docker-compose.yml`, så kontrakten kan læses og afprøves i browseren.

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

Opgaven i session 12 beder om fire ting. Her er de i eksemplet:

| Krav | I `swagger.json` |
|------|------------------|
| Alle endpoints med metoder og felter | `GET` og `POST /v1/notes` samt `GET /v1/notes/{id}`. Felterne står i `components.schemas`: `Note`, `NewNote` og `Error`. |
| Mindst ét fejlsvar pr. endpoint | `POST` har `400` (to eksempler), `GET {id}` har `404`, og alle tre har `500`. |
| Version i stien | `/v1/notes`. Koden er ændret tilsvarende, så den gamle `/notes` giver nu `404`. |
| `servers`-linje | `"servers": [{ "url": "http://localhost:3000" }]` |

## Ændringer i koden, og hvorfor

Specifikationen skal passe med virkeligheden, så tre ting i `server.js` er ændret i forhold til session 9:

1. **`/v1` i stien.** Opgaven spørger "skal I så ændre koden?". Her er svaret ja, ellers ville kontrakten lyve.
2. **`500` i stedet for et crash.** Uden en `try/catch` får en fejl i databasen hele Node-processen til at gå ned, og der kommer intet svar. Nu svarer serveren `500 {"error":"Internal server error"}`, og det kan specifikationen beskrive.
3. **CORS-preflight (`OPTIONS`).** "Try it out" i Swagger UI kører i browseren på `localhost:8081` og kalder `localhost:3000`. Ved en `POST` med JSON sender browseren først en `OPTIONS`-forespørgsel. Uden et svar på den virker `GET` i Swagger UI, men `POST` fejler. Det er en god snak i timen: kontrakten kan være korrekt, og alligevel kan værktøjet ikke kalde API'et.

## Gode steder at stoppe op i timen

- **Find en uoverensstemmelse med vilje.** Fjern fx `400`-svaret fra `POST` i `swagger.json`, eller ret `title` til `name`. Genindlæs Swagger UI. Ser det stadig rigtigt ud? Hvem opdager fejlen?
- **Swagger UI kender kun specifikationen.** Den kender ikke koden. Vis det med "Try it out" på `GET /v1/notes/999`: Swagger UI viser `404`, fordi serveren svarer det, og ikke fordi det står i specifikationen.
- **Import i Insomnia.** Importér `spec/swagger.json`, så får I en mappe med alle tre requests klar. Det er det, det andet par gør under "Byt og tjek".
- **Lint specifikationen.** Kør `npx @redocly/cli lint spec/swagger.json`. Den klager over, at der ikke er nogen `security` defineret, og det er rigtigt: API'et har ingen login. Det leder fint videre til sikkerhed i session 20.

## Bevidst udeladt

- **`PUT` og `DELETE`.** Backend fra session 9 har dem ikke, og specifikationen må kun beskrive det, der findes.
- **Login og sikkerhed.** Kommer i session 20.
- **Generering af specifikationen fra koden.** Her er `swagger.json` skrevet i hånden (med AI som første udkast), ligesom de studerende gør.
