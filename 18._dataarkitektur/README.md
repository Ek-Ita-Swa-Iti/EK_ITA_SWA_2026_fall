# Session 18: Dataarkitektur · Vælg det rigtige sted til jeres data

**ITA Software Architecture 2026 Fall**

> Indtil nu har jeres notes-service gemt sine noter ét sted. Men der er ikke én database, der er bedst. Der er en database, der er god til *det spørgsmål, I stiller jeres data*.
>
> I dag prøver I fire slags databaser på de samme noter. Så bygger I en vektordatabase ind i jeres notes-service, og til sidst vælger I database (eller API) til en række rigtige situationer.

---

## Dagens spørgsmål

**"Hvilken database skal vi bruge?" Hvorfor er det det forkerte spørgsmål at starte med?**

Det kan I svare på, når I går hjem, fordi I har prøvet at stille det samme spørgsmål til den forkerte database.

---

## Læringsmål

Efter i dag kan du:

- forklare, hvad en **relationel database**, en **dokumentdatabase**, en **key-value store** og en **vektordatabase** hver især er god til, og hvad de er dårlige til
- vælge et sted til data ud fra **de spørgsmål, I skal stille data**: hvad I slår op, hvor tit, og hvor slemt det er, hvis data er forkert eller forsvinder
- vurdere, hvornår I slet ikke skal have jeres egen database, men bruge en andens **API**
- bygge en **vektordatabase** ind i en arkitektur ved siden af den database, der er **sandhedskilden**, og forklare, hvad der sker, når de to er uenige

---

## Før timen

Downloads tager tid, så gør det hjemmefra.

- Hav jeres **notes-service** fra session 11–12 klar og kørende (`docker compose up`). Hvis jeres version ikke virker, så brug [`09._Layered_architecture_hands_on/example-node`](../09._Layered_architecture_hands_on/example-node).
- Tilføj disse services i jeres `docker-compose.yml` (ved siden af `backend` og `frontend`):

```yaml
  postgres:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  mongo:
    image: mongo:8
    ports:
      - "27017:27017"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant-data:/qdrant/storage

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama

volumes:
  qdrant-data:
  ollama-data:
```

- Start dem, og hent embedding-modellen (ca. 300 MB):

```bash
docker compose up -d
docker compose exec ollama ollama pull nomic-embed-text
```

- Hav **Insomnia** og jeres AI-agent klar. I må bruge agenten til alt i dag.

---

## Del 1: Fire spørgsmål, før I vælger (15 min)

Fælles på tavlen. Før I vælger et sted til data, skal I kunne svare på:

1. **Hvad skal I spørge data om?** Slå én ting op på et id? Tælle og sammenligne på tværs? Finde "noget, der ligner"?
2. **Hvor fast er formen?** Har alle rækker de samme felter, eller er hver ting forskellig?
3. **Hvor slemt er det, hvis data er forkert eller forsvinder?** En bankoverførsel eller en tæller for sidevisninger?
4. **Er det overhovedet jeres data?** Eller ejer en anden dem, og så skal I bare spørge dem?

Hold de fire spørgsmål op mod alt, hvad I laver i dag.

---

## Del 2: Øvelse · Samme noter, fire databaser (50 min)

Arbejd i par. Ved hver station gør I to ting: **løs den opgave, databasen er god til**, og **prøv en opgave, den er dårlig til**. Skriv én linje pr. station: *god til …, dårlig til …*

### Station A · Relationel (Postgres)

```bash
docker compose exec postgres psql -U postgres
```

```sql
CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT
);
INSERT INTO users (name) VALUES ('Ali'), ('Bo');
INSERT INTO notes (user_id, title, body) VALUES
  (1, 'Indkøb', 'Kaffebønner og mælk'),
  (1, 'Espresso', 'Maskinen skal afkalkes'),
  (2, 'Møde', 'Flyttet til torsdag');
```

- **God til:** Hvor mange noter har hver bruger? Skriv det som én `SELECT` med `JOIN` og `GROUP BY`.
- **Prøv:** `INSERT INTO notes (user_id, title) VALUES (99, 'Hvem ejer mig?');` Hvad siger databasen? Hvem beskytter jer her?
- **Dårlig til:** Find alle noter om kaffe. Prøv `WHERE body LIKE '%kaffe%'`. Finder I espresso-noten?

### Station B · Dokument (MongoDB)

Den kender I fra session 9.

```bash
docker compose exec mongo mongosh
```

```js
use notes
db.notes.insertMany([
  { title: "Indkøb", items: ["kaffebønner", "mælk"], done: false },
  { title: "Opskrift", ingredients: [{ name: "mel", gram: 500 }], tags: ["bagning"] },
  { title: "Møde", when: "torsdag", attendees: ["Ali", "Bo"] }
])
db.notes.find({ tags: "bagning" })
```

- **God til:** Tre noter med helt forskellige felter, og ingen `CREATE TABLE`. Tilføj en fjerde med felter, I selv finder på.
- **Prøv:** Indsæt en note **uden** `title`. Hvem stopper jer?
- **Dårlig til:** Tæl noter pr. bruger, når brugerne ligger i en anden collection. Spørg agenten, hvordan man gør (`$lookup`). Sammenlign med jeres SQL fra station A.

### Station C · Key-value (Redis)

```bash
docker compose exec redis redis-cli
```

```
INCR note:1:views
INCR note:1:views
GET note:1:views
SET session:abc "user=1" EX 30
TTL session:abc
LPUSH recent:ali 3 7 1
LRANGE recent:ali 0 4
```

- **God til:** Tællere, sessioner, der udløber af sig selv, og "seneste 5". Alt slås op på en nøgle, og det går lynhurtigt.
- **Prøv:** Vent 30 sekunder, og kør `GET session:abc`. Hvad skete der?
- **Dårlig til:** Find alle noter, hvor teksten indeholder "kaffe". Hvorfor kan I ikke det?
- **Spørg agenten:** Hvad sker der med data i Redis, når serveren genstarter? Skal man gemme noget i Redis, man ikke har andre steder?

### Station D · Vektor (Qdrant + Ollama)

En **embedding** er en tekst lavet om til en liste af tal (her 768 tal). Tekster, der betyder det samme, får tal, der ligger tæt på hinanden. En **vektordatabase** er god til ét spørgsmål: *hvilke punkter ligger tættest på det her?*

I Insomnia:

1. **Lav en embedding:** `POST http://localhost:11434/api/embed` med

   ```json
   { "model": "nomic-embed-text", "input": "Maskinen skal afkalkes" }
   ```

   Se svaret. Det er hele "betydningen" af sætningen, som tal.
2. **Opret en collection:** `PUT http://localhost:6333/collections/notes` med

   ```json
   { "vectors": { "size": 768, "distance": "Cosine" } }
   ```

3. **Gem tre noter:** `PUT http://localhost:6333/collections/notes/points`. Lav en embedding af hver note, og kopiér vektoren ind:

   ```json
   { "points": [ { "id": 2, "vector": [ /* de 768 tal */ ], "payload": { "title": "Espresso" } } ] }
   ```

   Er det for besværligt at kopiere? Lad agenten skrive et lille script, der gør trin 1 og 3 for jer.
4. **Søg:** Lav en embedding af "kaffe", og send den til `POST http://localhost:6333/collections/notes/points/query` med `{ "query": [ /* tallene */ ], "limit": 3, "with_payload": true }`.
5. Åbn <http://localhost:6333/dashboard>, og se jeres punkter.

- **God til:** Finder I espresso-noten, selvom ordet "kaffe" ikke står i den? Se `score`.
- **Dårlig til:** Hvor mange noter har Ali? Kan Qdrant svare på det?

---

## Pause (15 min)

---

## Del 3: Øvelse · Byg vektordatabasen ind i notes-service (40 min)

Nu skal jeres notes-service kunne søge på betydning. Brugeren skal kunne finde "noten om kaffen".

**Krav:**

- `POST /v1/notes` gemmer noten som før **og** laver en embedding af `title + body` og gemmer den i Qdrant med samme `id`.
- Nyt endpoint: `GET /v1/notes/search?q=kaffe` laver en embedding af `q`, spørger Qdrant og returnerer de 3 bedste noter.
- Koden til Qdrant og Ollama ligger i **nye filer**, ikke i `server.js`. I bestemmer selv hvor, men skal kunne forklare valget (tænk på lagene fra session 8–9).
- Fra containeren hedder services `http://ollama:11434` og `http://qdrant:6333`, ikke `localhost`. Hvorfor? (Session 9.)
- Opdatér `swagger.json` fra session 12 med det nye endpoint.

**Én beslutning, I skal træffe og skrive ned:** Når søgningen finder et id i Qdrant, henter I så noten fra Qdrants `payload` eller fra jeres egen database? Hvilken af dem er **sandhedskilden**?

**Færdig betyder:** Opret fem noter. En søgning på "kaffe" finder espresso-noten.

### Ødelæg det

Gæt først, hvad der sker. Prøv det så, og skriv svaret ned.

1. `docker compose stop qdrant`. Opret en note. Bliver den gemt? Kan den findes, når Qdrant kører igen?
2. Slet en note med `DELETE /v1/notes/:id`. Dukker den stadig op i søgningen?
3. Skift model til `all-minilm` (`ollama pull all-minilm`). Hvad siger Qdrant? Hvad skal der ske med alle de vektorer, I allerede har gemt?

Det her er prisen for at have **to steder til de samme data**. Hvad skulle der til for at genopbygge hele Qdrant ud fra jeres egen database?

---

## Del 4: Workshop · Vælg til situationen (30 min)

I par: tag tre af kortene. For hvert kort skal I vælge **ét sted til data**: relationel, dokument, key-value, vektor, filer (object storage), eller *en andens API*. Begrund valget med de fire spørgsmål fra Del 1, og sig, hvad I **giver afkald på**.

| # | Situation |
|:-:|-----------|
| 1 | En webshop skal gemme ordrer og betalinger. Ingen ordre må forsvinde eller tælles dobbelt. |
| 2 | En produktkatalog, hvor en cykel, en t-shirt og en kaffemaskine har helt forskellige egenskaber. |
| 3 | Et login, der skal huske, hvem der er logget ind, i 30 minutter. Og højst 5 forkerte forsøg i minuttet. |
| 4 | En supportbot, der skal svare ud fra 2.000 sider dokumentation. |
| 5 | En app, der viser vejret i København. |
| 6 | Brugere skal kunne uploade profilbilleder og PDF'er. |
| 7 | Et dashboard, der viser "mest læste noter i dag". |

Tre par præsenterer ét kort hver. Var der nogen, der valgte forskelligt på det samme kort? Hvem har ret?

> Hint til kort 5: Hvem ejer vejrdata? Tænk på DMI's API fra session 12. Skal I gemme noget selv, eller bare spørge, og måske huske svaret et kort stykke tid?

---

## Del 5: Sådan gør de andre (15 min)

- **Postgres er standardvalget.** De fleste systemer har én relationel database som sandhedskilde og *måske* én specialist ved siden af. Det kaldes **polyglot persistence**, og hver ekstra database er en ekstra ting, der kan gå ned og blive uenig med de andre.
- **Måske behøver I ikke en ekstra database.** [`pgvector`](https://github.com/pgvector/pgvector) lægger vektorsøgning ind i Postgres, og MongoDB Atlas har det samme. Så er der ét sted til data og ingen synkronisering. Prisen er færre funktioner og mindre skala end en dedikeret vektordatabase som Qdrant.
- **Det I lavede i Del 3, er "R" i RAG** (Retrieval-Augmented Generation). Det er sådan "chat med jeres dokumenter" virker: find de 3 nærmeste tekster, og giv dem til en sprogmodel sammen med spørgsmålet. Kort 4 fra workshoppen er præcis det.

Tilbage til dagens spørgsmål: **Hvorfor er "hvilken database?" det forkerte spørgsmål at starte med?**

---

## Efter timen

- Gem jeres notes-service med søgningen. I skal bruge den igen.
- Skriv fem linjer i jeres semesternotesbog: Hvilken database er sandhedskilden i jeres notes-service, hvilken er afledt, og hvad gør I, når de er uenige?

---

## Optional

- [optional] Qdrant: [Quickstart](https://qdrant.tech/documentation/quickstart/)
- [optional] Ollama: [Embedding models](https://ollama.com/blog/embedding-models)
- [optional] `pgvector`: [README](https://github.com/pgvector/pgvector)
- [optional] Kleppmann, M. — *Designing Data-Intensive Applications*, kapitel 2 (datamodeller og forespørgselssprog).
