# notes-service med vektordatabase

Eksemplet til [session 18](../README.md). Den samme notes-service som i
[session 9](../../09._Layered_architecture_hands_on/example-node/README.md), nu med to databaser:

| Database | Hvad den gemmer | Hvor den kører |
|----------|-----------------|----------------|
| **MySQL** | Noterne. Det er **sandhedskilden**. | I Docker, på jeres computer |
| **Qdrant** | Noternes *betydning*, som tal. Bruges kun til søgning. | I skyen (Qdrant Cloud) |

I sender **tekst** til Qdrant. Qdrant laver selv teksten om til tal (en *embedding*), både når en note
gemmes, og når I søger. I skal ikke installere nogen model.

## Kør det

1. Kopiér `.env.example` til `.env`, og udfyld `QDRANT_URL`, `QDRANT_API_KEY` og `QDRANT_COLLECTION`.
   `.env` står i `.gitignore`, så den kommer ikke i Git.
2. Start:

   ```bash
   docker compose up --build
   ```

3. Åbn <http://localhost:8080>, og søg på "kaffe".

Når backend starter, opretter den samlingen i Qdrant (hvis den ikke findes) og gemmer alle noter fra
MySQL i den. I loggen står der `Vector index rebuilt from MySQL: 8 notes`.

Uden `.env` virker alt undtagen søgningen, som svarer `503`.

## API

| Metode | Sti | Hvad sker der |
|--------|-----|---------------|
| `GET` | `/v1/notes` | Alle noter fra MySQL |
| `GET` | `/v1/notes/:id` | Én note fra MySQL |
| `POST` | `/v1/notes` | Gemmes i MySQL, **og** teksten sendes til Qdrant |
| `PUT` | `/v1/notes/:id` | Opdateres i MySQL, **og** i Qdrant |
| `DELETE` | `/v1/notes/:id` | Slettes i MySQL, **og** i Qdrant |
| `GET` | `/v1/notes/search?q=kaffe` | Qdrant finder de 3 nærmeste id'er, noterne hentes fra MySQL |

```bash
curl "localhost:3000/v1/notes/search?q=kaffe"
curl -X POST localhost:3000/v1/notes -H 'Content-Type: application/json' -d '{"title":"Te","body":"Grøn te fra Netto"}'
```

## Filerne

```
backend/src/
├── presentation/
│   └── server.js                  ← HTTP. Skriver til MySQL først, så til Qdrant
└── persistence/
    ├── notesMySQLRepository.js    ← MySQL: sandhedskilden
    └── notesVectorIndex.js        ← Qdrant: søgning på betydning
```

Læs `notesVectorIndex.js` først. Den er kort, og hele idéen står i den:

- `ensureCollection()` opretter samlingen med `size: 384`, fordi modellen laver 384 tal pr. tekst.
- `indexAll()` sender `{ text, model }` i stedet for tal.
- `search()` sender søgeteksten på samme måde og får id'er og `score` tilbage.
