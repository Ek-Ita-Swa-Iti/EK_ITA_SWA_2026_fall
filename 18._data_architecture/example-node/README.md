# notes-service til session 18

Udgangspunktet for [session 18](../README.md). Det er den samme notes-service som i
[session 9](../../09._Layered_architecture_hands_on/example-node/README.md), bygget op til det, I har lavet i session 11–12:

- **Versioneret API** med `GET`, `POST`, `PUT` og `DELETE` på `/v1/notes`
- **MongoDB** er sandhedskilden (`backend/src/persistence/notesMongoDBRepository.js`)
- **`spec/swagger.json`** med Swagger UI på <http://localhost:8081>
- **De fire databaser og Ollama** fra "Før timen" i `docker-compose.yml`

Semantisk søgning (`/v1/notes/search`) er **ikke** bygget ind. Det er jeres opgave i Del 3.

## Kør det

```bash
docker compose up -d --build
docker compose exec ollama ollama pull nomic-embed-text
```

| Service | Adresse fra jeres computer | Adresse fra en anden container |
|---------|----------------------------|--------------------------------|
| backend | <http://localhost:3000/v1/notes> | `http://backend:3000` |
| frontend | <http://localhost:8080> | |
| Swagger UI | <http://localhost:8081> | |
| Postgres | `localhost:5432` (bruger `postgres`, password `postgres`) | `postgres:5432` |
| MongoDB | `localhost:27017` | `mongo:27017` |
| Redis | `localhost:6379` | `redis:6379` |
| Qdrant | <http://localhost:6333/dashboard> | `http://qdrant:6333` |
| Ollama | <http://localhost:11434> | `http://ollama:11434` |

Stop med `docker compose down`. Tilføj `-v`, hvis I også vil slette Qdrant-data og den hentede model.

## Prøv API'et

```bash
curl localhost:3000/v1/notes
curl localhost:3000/v1/notes/2
curl -X POST localhost:3000/v1/notes -H 'Content-Type: application/json' -d '{"title":"Bønner","body":"Køb nye espressobønner"}'
curl -X PUT localhost:3000/v1/notes/3 -H 'Content-Type: application/json' -d '{"title":"Møde","body":"Flyttet til fredag"}'
curl -X DELETE localhost:3000/v1/notes/3
```

Eller importér `spec/swagger.json` i Insomnia, som i session 12.

## Lagene

```
backend/src/
├── presentation/
│   └── server.js                    ← HTTP og JSON
└── persistence/
    ├── notesMongoDBRepository.js    ← MongoDB (i brug)
    └── notesRepository.js           ← hardcodet, uden database
```

Begge persistence-filer har den samme kontrakt: `findAll()`, `findById(id)`, `create(title, body)`,
`update(id, title, body)` og `remove(id)`, alle `async`. `server.js` vælger én af dem i sin
`require(...)`-linje øverst.

Noterne starter med tre eksempler: "Indkøb", "Espresso" og "Møde". "Espresso" er den, en søgning på
"kaffe" skal finde, selvom ordet ikke står i den.
