# Spørgeliste fra session 11: et eksempel

Sådan kan en spørgeliste fra [session 11](../../11._rest_api_architecture_2/README.md) se ud. Par A har bygget en klient til Par B's notes-service uden at åbne koden. De har kun haft Insomnia, `docker compose`-outputtet og muligheden for at spørge Par B.

Hvert spørgsmål har tre ting: hvad de ville vide, hvordan de fandt svaret, og hvad svaret var.

## Det, der virker

| # | Spørgsmål | Hvordan fandt vi svaret? | Svar |
|:-:|-----------|--------------------------|------|
| 1 | Hvilken port kører API'et på? | Læste `docker compose`-outputtet | `3000`. Port `8080` er frontenden, ikke API'et. |
| 2 | Hvad er adressen til listen af noter? | Gættede `/api/notes` (404), så `/notes` | `GET /notes` |
| 3 | Hvordan henter man én note? | Prøvede `/notes/1` | `GET /notes/{id}` |
| 4 | Er id et tal eller en tekst? | Så det i svaret fra `GET /notes` | Et heltal: `1`, `2`, `3` … |
| 5 | Hvad hedder felterne på en note? | Så det i svaret fra `GET /notes` | `id`, `title` og `body` |
| 6 | Hvordan opretter man en note? | Spurgte Par B | `POST /notes` med JSON |
| 7 | Hvilke felter skal med, når man opretter? | Spurgte Par B | `title` og `body`. Ikke `id`, det laver serveren. |
| 8 | Hvad får man tilbage, når noten er oprettet? | Prøvede det | `201` og hele noten, med det nye `id` |
| 9 | Skal man sende en `Content-Type`-header? | Gættede, at den skulle være `application/json` | Serveren tjekker den ikke. Det virkede også uden. |
| 10 | Kan man rette eller slette en note? | Prøvede `PUT /notes/1` og `DELETE /notes/1` | Nej. Begge giver `404 {"error":"Not found"}`. |

## Det, der går galt

| # | Spørgsmål | Hvordan fandt vi svaret? | Svar |
|:-:|-----------|--------------------------|------|
| 11 | Hvad sker der, hvis `title` mangler? | Prøvede det | `400 {"error":"title and body are required"}` |
| 12 | Hvad sker der, hvis JSON'en er ugyldig? | Prøvede at sende `{title:` | `400 {"error":"Invalid JSON body"}` |
| 13 | Hvad sker der, hvis noten ikke findes? | Prøvede `/notes/999` | `404 {"error":"Note not found"}` |
| 14 | Hvad sker der med `/notes/abc`? | Prøvede det | `404 {"error":"Not found"}`. En anden besked end i nr. 13. |
| 15 | Har fejl altid samme form? | Sammenlignede svarene | Ja, altid `{"error": "..."}` |
| 16 | Hvad sker der, hvis databasen er nede? | Spurgte Par B | De vidste det ikke. Vi stoppede `mongo`, og så svarede API'et slet ikke. |
| 17 | Må `title` være en tom tekst? | Prøvede `"title": ""` | Nej, samme `400` som nr. 11 |
| 18 | Er der en grænse for, hvor mange noter listen returnerer? | Spurgte Par B | Nej, man får alle sammen |

## Det, vi blev spurgt om som API-ejere

- "Hvad hedder feltet med teksten? `text`? `content`?" Det hedder `body`.
- "Skal vi sende `id` med, når vi opretter?" Nej.
- "Hvorfor svarer port 8080 med HTML?" Det er frontenden. API'et er på 3000.

## Fra spørgeliste til kontrakt

Næsten hvert spørgsmål svarer til et sted i [`spec/swagger.json`](spec/swagger.json):

| Spørgsmål | I `swagger.json` |
|-----------|------------------|
| 1 | `servers` |
| 2, 3, 6, 10 | `paths` og metoderne under dem |
| 4, 5, 7 | `components.schemas` (`Note` og `NewNote`) |
| 8 | `responses` → `201` |
| 11-14, 16, 17 | `responses` → `400`, `404`, `500` |
| 15 | `components.schemas.Error` |

Nogle af svarene er ændret i specifikationen. Stien har fået `/v1`, en database-fejl giver nu `500`, `/notes/abc` giver `400`, og nr. 10 er blevet til `PUT` og `DELETE`. Det var spørgelisten, der viste, hvor API'et var uklart.

Spørgsmål 18 har intet sted i specifikationen, fordi der ikke er nogen paginering. Men det er et godt spørgsmål. Det er forandringskort nr. 3 fra session 11.
