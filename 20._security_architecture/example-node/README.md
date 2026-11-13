# notes-service: udgangspunktet for session 20

Udgangspunktet for [session 20](../README.md). Det er notes-servicen fra
[session 19](../../19._data_architecture_2/example-node/README.md), som den ser ud, når hele tutorialen er lavet:

- **Versioneret API** med `GET`, `POST`, `PUT` og `DELETE` på `/v1/notes`
- **Semantisk søgning** på `GET /v1/notes/search?q=…`: Ollama (`bge-m3`) laver tekst om til tal, og Qdrant finder de nærmeste noter
- **MongoDB** er sandhedskilden, og **Qdrant** er et søgeindeks, der bygges op igen, når backend starter
- **Et søgefelt** i frontend og **`spec/swagger.json`** med `/v1/notes/search`, vist i Swagger UI på <http://localhost:8081>

Brug den, hvis jeres egen notes-service ikke virker, eller hvis I vil starte forfra. To ting er med vilje forkerte, og det er dem, I laver om i dag:

- **MongoDB-passwordet står direkte i `docker-compose.yml`** (`notes123`), både hos `mongo` og i backends `MONGO_URL`.
- **API'et er helt åbent:** Alle kan oprette, rette og slette noter.

## Kør det

```bash
docker compose up -d --build
docker compose exec ollama ollama pull bge-m3     # første gang, ca. 1,2 GB
docker compose restart backend                    # så indekset bygges med modellen
```

| Service | Adresse fra jeres computer | Adresse fra en anden container |
|---------|----------------------------|--------------------------------|
| backend | <http://localhost:3000/v1/notes> | `http://backend:3000` |
| frontend | <http://localhost:8080> | |
| Swagger UI | <http://localhost:8081> | |
| MongoDB (bruger `notes`) | `localhost:27017` | `mongo:27017` |
| Ollama | <http://localhost:11434> | `http://ollama:11434` |
| Qdrant | <http://localhost:6333/dashboard> | `http://qdrant:6333` |

Stop med `docker compose down`. MongoDB og Qdrant har ingen volume, så næste gang starter I forfra med de
tre eksempelnoter. Ollama har en volume (`ollama-data`), så modellen skal kun hentes én gang.

## Prøv API'et

```bash
curl localhost:3000/v1/notes
curl -X POST localhost:3000/v1/notes -H 'Content-Type: application/json' -d '{"title":"Cykel","body":"Ny slange til baghjulet"}'
curl "localhost:3000/v1/notes/search?q=kaffe"
curl -X DELETE localhost:3000/v1/notes/3
```

Eller importér `spec/swagger.json` i Insomnia, som i session 12.

## Lagene

```
backend/src/
├── presentation/
│   └── server.js                    ← HTTP og JSON, kender kun notesService
├── application/
│   └── notesService.js              ← bestemmer rækkefølgen: MongoDB → Ollama → Qdrant
└── persistence/
    ├── notesMongoDBRepository.js    ← MongoDB, sandhedskilden
    ├── notesRepository.js           ← hardcodet, uden database
    ├── embeddingModel.js            ← tekst → tal via Ollama
    └── notesVectorRepository.js     ← tal → Qdrant
```

Koden i `application/` og de to nye persistence-filer er den samme som i trin 2–5 i
[tutorialen fra session 19](../../19._data_architecture_2/README.md).
