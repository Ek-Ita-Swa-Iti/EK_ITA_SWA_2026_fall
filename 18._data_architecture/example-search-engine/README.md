# Søgemaskinen: MySQL og Qdrant side om side

Eksemplet til [session 18](../README.md). En lille søgemaskine over 20 opdigtede hjemmesider. Hver
søgning køres **to gange**, og siden viser begge dele ved siden af hinanden:

| | MySQL | Qdrant |
|---|---|---|
| Søger på | **bogstaver** (`LIKE '%kaffe%'`) | **betydning** (de nærmeste punkter) |
| Gemmer siderne som | tekst | 384 tal pr. side (en *embedding*) |
| Rolle | **sandhedskilden** | en søgeindgang, der kan bygges op igen fra MySQL |

## Kør det

```bash
docker compose up --build
```

Åbn <http://localhost:8080>, og søg på "kaffe", "motion" eller "ferie i Italien".

Første build tager et par minutter, fordi embedding-modellen bliver hentet ind i backend-imaget
(ca. 120 MB). Bagefter kører alt på jeres egen computer: Der er ingen nøgle og ingen konto, og ingen
data forlader maskinen.

| Service | Adresse |
|---------|---------|
| Søgemaskinen (frontend) | <http://localhost:8080> |
| Backend | <http://localhost:3000/v1/search?q=kaffe> |
| Qdrant-dashboard | <http://localhost:6333/dashboard> |
| MySQL | `localhost:3306` (bruger `root`, password `my-secret-pw`, database `search_db`) |

Stop med `docker compose down`. MySQL og Qdrant har ingen volumes, så næste gang starter I forfra
med de 20 sider.

## De tre lag

```
backend/src/
├── presentation/
│   └── server.js                  ← HTTP ind, JSON ud. Kender kun application-laget
├── application/
│   └── searchService.js           ← søgemaskinens regler: hvilken database spørges, i hvilken rækkefølge
└── persistence/
    ├── pagesMySQLRepository.js    ← MySQL: siderne som tekst + tekstsøgning
    ├── pagesVectorRepository.js   ← Qdrant: siderne som tal + "find de nærmeste"
    ├── embeddingModel.js          ← modellen, der laver tekst om til 384 tal
    └── seedPages.js               ← de 20 sider
```

## Hvad sker der ved en søgning?

`searchService.search(q)` kører de to søgninger samtidig:

**MySQL:** `SELECT … WHERE title LIKE '%kaffe%' OR body LIKE '%kaffe%'`. Den finder kun sider, hvor
bogstaverne står.

**Qdrant**, i fire trin, som frontend viser:

1. Søgeteksten får `query: ` foran. Modellen (`multilingual-e5-small`) er trænet til at se `query: ` foran
   søgninger og `passage: ` foran det, der gemmes.
2. `embeddingModel.embed()` laver teksten om til 384 tal.
3. `pagesVectorRepository.query()` sender de 384 tal til Qdrant og får de 5 nærmeste id'er tilbage med en
   `score` (cosine similarity).
4. Siderne hentes i MySQL med `WHERE id IN (…)`, fordi Qdrant kun kender id'er.

## Hvad sker der, når en side gemmes?

`searchService.addPage()` gemmer siden i MySQL først. Derefter laves `passage: titel. tekst` om til
384 tal, og de gemmes i Qdrant med samme id. Det sker automatisk ved hver indsættelse. Prøv det under
**Tilføj en side** nederst på siden.

Når backend starter, sammenligner den antallet af sider i MySQL og Qdrant. Er de forskellige, bygger
den hele Qdrant op igen ud fra MySQL.

## Ødelæg det

```bash
docker compose stop qdrant     # MySQL-søgningen virker stadig, Qdrant-søgningen viser en fejl
docker compose start qdrant
docker compose restart backend # bygger Qdrant op igen ud fra MySQL, hvis noget mangler
```
