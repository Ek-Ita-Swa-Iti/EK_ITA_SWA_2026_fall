# Session 18: Dataarkitektur · Søg på betydning med en vektordatabase

**ITA Software Architecture 2026 Fall**

> Jeres notes-service kan finde note nummer 3. Men kan den finde *noten om kaffen*, hvis ordet "kaffe" ikke står i den?
>
> En almindelig database sammenligner bogstaver. I dag møder I en database, der sammenligner **betydning**: en vektordatabase. I finder ud af, hvordan den virker, og hvorfor det overhovedet er muligt at søge på den måde.

---

## Dagens spørgsmål

**Hvordan kan en database finde "noten om kaffen", når ordet kaffe ikke står i den?**

---

## Læringsmål

Efter i dag kan du:

- forklare, hvad en **embedding** er: en tekst lavet om til en liste af tal, hvor tekster, der betyder det samme, får tal, der ligger tæt på hinanden
- forklare, **hvorfor man kan søge** i en vektordatabase: at søge er at finde de punkter, der ligger tættest på
- bruge en **vektordatabase** (Qdrant) fra Insomnia og fra kode
- forklare arkitekturen: **MySQL er sandhedskilden**, og vektordatabasen er en søgeindgang ved siden af

---

## Før timen

- Hent MySQL hjemmefra: `docker pull mysql:8.0`
- Hav **Insomnia** klar.
- Underviseren giver jer en **URL** og en **API-nøgle** til holdets vektordatabase i Qdrant Cloud.
  - Vil I hellere have jeres egen? Opret en gratis konto på <https://cloud.qdrant.io>, lav en **Free**-cluster, og lav en API-nøgle under **API Keys**.

---

## Del 1: Problemet (15 min)

Start eksemplet i [`example-node`](example-node). Det har 8 noter i MySQL. **Ingen af dem nævner kaffe.**

```bash
cd 18._data_architecture/example-node
docker compose up --build
```

Søg efter kaffe med SQL:

```bash
docker compose exec mysql mysql -uroot -pmy-secret-pw notes_db
```

```sql
SELECT * FROM notes WHERE body LIKE '%kaffe%' OR title LIKE '%kaffe%';
```

Tomt. Men en af noterne handler jo om kaffe. Hvilken? Hvordan vidste *I* det?

En database sammenligner **bogstaver**. For at finde noten om kaffen skal den kunne sammenligne **betydning**. Men en computer kan kun regne med tal. Så spørgsmålet er: **Kan man lave betydning om til tal?**

---

## Del 2: Betydning som tal (30 min)

### På papir, i par

Tegn et koordinatsystem med to akser:

- **x:** "noget man drikker" (0 = slet ikke, 10 = helt sikkert)
- **y:** "noget med motion" (0 = slet ikke, 10 = helt sikkert)

Sæt de her ord ind som punkter: **kaffe, espresso, te, løb, fodbold, regning**.

- Hvilke punkter ligger tæt på hinanden?
- Hvor ligger "regning"?
- Sæt et nyt ord ind: **cappuccino**. Hvilket ord ligger det tættest på?

**Det I lige har lavet, er en embedding.** Hvert ord er blevet til to tal, fx kaffe = `[9, 1]`. Ord, der betyder noget lignende, ligger tæt på hinanden. Og at **søge** er bare at spørge: *hvilke punkter ligger tættest på det her?*

### Fra 2 tal til 384 tal

En rigtig **embedding-model** gør det samme, men:

- med **384 tal** i stedet for 2 (384 akser, ikke kun "drikke" og "motion")
- for hele sætninger, ikke kun ord
- og ingen har valgt akserne. Modellen har selv lært dem ved at læse enorme mængder tekst.

Hvor tæt to tekster er, måles som regel med **cosine similarity**: Peger de to pile i samme retning? `1` betyder samme retning (næsten samme betydning), og jo lavere tallet er, jo mindre har de med hinanden at gøre.

En **vektordatabase** er en database, der er bygget til ét spørgsmål: *Hvilke punkter ligger tættest på det her?* Og den kan svare hurtigt, også når der er millioner af punkter.

---

## Del 3: Prøv vektordatabasen direkte (30 min)

I par, i Insomnia. Alle requests går til jeres Qdrant-URL og skal have headeren `api-key: <jeres nøgle>`. Brug jeres eget navn til samlingen, fx `par3`, så I ikke skriver i de andres.

**1. Opret en samling** (en "tabel" til vektorer): `PUT <url>/collections/par3`

```json
{ "vectors": { "size": 384, "distance": "Cosine" } }
```

Hvorfor `384`? Fordi det er antallet af tal, modellen laver for hver tekst.

**2. Gem tre noter:** `PUT <url>/collections/par3/points?wait=true`

```json
{
  "points": [
    { "id": 1, "vector": { "text": "Espresso. Maskinen skal afkalkes", "model": "intfloat/multilingual-e5-small" }, "payload": { "title": "Espresso" } },
    { "id": 2, "vector": { "text": "Indkøb. Mælk og brød", "model": "intfloat/multilingual-e5-small" }, "payload": { "title": "Indkøb" } },
    { "id": 3, "vector": { "text": "Træning. Løb 5 km i Fælledparken", "model": "intfloat/multilingual-e5-small" }, "payload": { "title": "Træning" } }
  ]
}
```

**Læg mærke til det: I sender tekst, ikke tal.** Qdrant sender teksten til modellen og gemmer de 384 tal, der kommer ud.

**3. Se tallene:** `POST <url>/collections/par3/points`

```json
{ "ids": [1], "with_vector": true }
```

Der er de: 384 tal. Det er "betydningen" af "Espresso. Maskinen skal afkalkes".

**4. Søg:** `POST <url>/collections/par3/points/query`

```json
{ "query": { "text": "kaffe", "model": "intfloat/multilingual-e5-small" }, "limit": 3, "with_payload": true }
```

Kom espresso-noten øverst? Se på `score` for hver note.

**5. Prøv selv:** Søg på "motion", "noget at spise" og "fodbold".

- Får I altid et svar, også når ingen note passer?
- Hvad er `score`, når den passer godt, og når den ikke gør?

> **Vigtigt:** En vektordatabase finder *altid* de nærmeste punkter, også selvom de ligger langt væk. Den siger aldrig "ingen resultater" af sig selv. Det er jeres job at bestemme, hvornår en `score` er for lav.

---

## Pause (15 min)

---

## Del 4: Vektordatabasen i notes-service (40 min)

Skriv URL, nøgle og jeres samlingsnavn ind i `.env` (se [`example-node/README.md`](example-node/README.md)), og genstart med `docker compose up --build`. Søg på "kaffe" på <http://localhost:8080>.

### Læs koden (15 min)

Åbn `backend/src/persistence/notesVectorIndex.js` og `backend/src/presentation/server.js`. Svar i jeres par:

- **Hvor bliver teksten lavet om til tal?** (Søg efter et sted i koden, hvor der regnes. Er der et?)
- Når en note oprettes: Hvilken database skrives der til først? Hvorfor i den rækkefølge?
- Når I søger: Qdrant svarer med id'er. Hvorfor henter vi så noterne fra MySQL i stedet for at gemme hele noten i Qdrant?
- Hvad sker der i `rebuildIndex()`, når backend starter?

### Byg videre (25 min)

1. **Opret en ny note** i Insomnia, fx `{ "title": "Te", "body": "Grøn te fra Netto" }`. Søg på "noget varmt at drikke". Bliver den fundet med det samme?
2. **Sæt en grænse:** Søg på "fodbold". Får I noter, der intet har med fodbold at gøre? Tilføj `score_threshold` i `search()` i `notesVectorIndex.js`, så for dårlige svar bliver sorteret fra. Find selv en god værdi.
3. **Ødelæg det:** Skriv en forkert API-nøgle i `.env`, og genstart. Opret en note.
   - Bliver den gemt i MySQL?
   - Kan den findes med søgningen?
   - Ret nøglen, og genstart. Kan den findes nu? Hvorfor? (Se `rebuildIndex()`.)

Pointen med 3: **Vektordatabasen kan altid bygges op igen ud fra MySQL.** Derfor er MySQL sandhedskilden, og Qdrant er "bare" en søgeindgang.

---

## Del 5: Hvor bruges det? (15 min)

- **"Chat med jeres dokumenter"** (RAG): Find de 3 tekster, der ligger tættest på spørgsmålet, og giv dem til en sprogmodel sammen med spørgsmålet. Det er sådan, en supportbot kan svare ud fra en manual.
- **Anbefalinger:** "Andre noter/produkter/film, der ligner denne."
- **Billedsøgning:** Den samme idé virker med billeder. Et billede kan også laves om til tal.

Andre måder at gøre det på:

- **ChromaDB** laver også embeddings automatisk, men i klientbiblioteket i jeres kode i stedet for i databasen.
- **pgvector** lægger vektorsøgning ind i Postgres. Så er der kun én database.
- **Modellen er et valg:** Vi bruger en *flersproget* model, fordi noterne er på dansk. En model, der er trænet på engelsk, ville finde dårligere svar.

> **Data i skyen:** Den gratis model i Qdrant Cloud kører i USA. Læg ikke personoplysninger i den.

Tilbage til dagens spørgsmål: **Hvordan kan en database finde "noten om kaffen", når ordet kaffe ikke står i den?**

---

## Efter timen

Skriv fem linjer i jeres semesternotesbog: Forklar med egne ord, og uden ordet "AI", hvorfor vektordatabasen kan finde espresso-noten, når I søger på "kaffe".

---

## Optional

- [optional] Qdrant: [Cloud Inference](https://qdrant.tech/documentation/inference/cloud-inference/), som er det, der laver tekst om til tal i vores eksempel
- [optional] Qdrant: [What is a vector database?](https://qdrant.tech/articles/what-is-a-vector-database/)
- [optional] `pgvector`: [README](https://github.com/pgvector/pgvector)
