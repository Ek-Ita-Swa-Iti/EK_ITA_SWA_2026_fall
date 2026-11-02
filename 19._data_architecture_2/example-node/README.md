# notes-service: udgangspunktet for session 19

Udgangspunktet for tutorialen i [session 19](../README.md). Det er den samme notes-service som i
[session 9](../../09._Layered_architecture_hands_on/example-node/README.md), bygget op til det, I har lavet i session 11–12:

- **Versioneret API** med `GET`, `POST`, `PUT` og `DELETE` på `/v1/notes`
- **MongoDB** er sandhedskilden (`backend/src/persistence/notesMongoDBRepository.js`)
- **`spec/swagger.json`** med Swagger UI på <http://localhost:8081>

Brug den, hvis jeres egen notes-service ikke virker, eller hvis I vil starte forfra. Semantisk søgning
(`/v1/notes/search`), Ollama og Qdrant er **ikke** bygget ind. Det er dagens tutorial.

## Kør det

```bash
docker compose up --build
```

| Service | Adresse fra jeres computer | Adresse fra en anden container |
|---------|----------------------------|--------------------------------|
| backend | <http://localhost:3000/v1/notes> | `http://backend:3000` |
| frontend | <http://localhost:8080> | |
| Swagger UI | <http://localhost:8081> | |
| MongoDB | `localhost:27017` | `mongo:27017` |

Stop med `docker compose down`. MongoDB har ingen volume, så næste gang starter I forfra med de tre
eksempelnoter.

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

Der er **intet application-lag** endnu. Det laver I i trin 4 i tutorialen.

Begge persistence-filer har den samme kontrakt: `findAll()`, `findById(id)`, `create(title, body)`,
`update(id, title, body)` og `remove(id)`, alle `async`. `server.js` vælger én af dem i sin
`require(...)`-linje øverst.

Noterne starter med tre eksempler: "Indkøb", "Espresso" og "Møde". "Espresso" er den, en søgning på
"kaffe" skal finde, når I er færdige, selvom ordet ikke står i den.
