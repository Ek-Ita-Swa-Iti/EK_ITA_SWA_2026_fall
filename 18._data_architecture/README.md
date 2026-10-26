# Session 18: Dataarkitektur · Søg på betydning med en vektordatabase

**ITA Software Architecture 2026 Fall**

> Søg på "motion" i en almindelig database, og du finder kun sider, hvor ordet "motion" står. Men siden om løb handler jo også om motion.
>
> En almindelig database sammenligner bogstaver. I dag møder I en database, der sammenligner **betydning**: en vektordatabase. I finder ud af, hvordan den virker, og hvorfor det overhovedet er muligt at søge på den måde.

---

## Dagens spørgsmål

**Hvordan kan en database finde siden om løb, når I søger på "motion", og ordet ikke står på siden?**

---

## Læringsmål

Efter i dag kan du:

- forklare, hvad en **embedding** er: en tekst lavet om til en liste af tal, hvor tekster, der betyder det samme, får tal, der ligger tæt på hinanden
- forklare, **hvorfor man kan søge** i en vektordatabase: at søge er at finde de punkter, der ligger tættest på
- bruge en **vektordatabase** (Qdrant) og læse koden, der taler med den
- forklare arkitekturen: **MySQL er sandhedskilden**, og vektordatabasen er en søgeindgang ved siden af

---

## Før timen

Byg eksemplet hjemmefra. Første gang hentes en embedding-model (ca. 120 MB), og det tager et par minutter.

```bash
cd 18._data_architecture/example-search-engine
docker compose up --build
```

Åbn <http://localhost:8080>. Kan I søge, er I klar.

---

## Del 1: To søgninger, samme side (20 min)

Eksemplet er en lille **søgemaskine** over 20 opdigtede hjemmesider. Hver søgning køres to gange, og I ser begge resultater side om side:

- **Venstre:** MySQL og den SQL, der bliver kørt
- **Højre:** Qdrant og de trin, søgningen går igennem

I par: Søg på de her, og skriv ned, hvad hver side finder:

| Søgning | MySQL fandt | Qdrant fandt |
|---------|-------------|--------------|
| kaffe | | |
| billig kaffe | | |
| motion | | |
| ferie i Italien | | |
| spare penge | | |

- Hvorfor finder MySQL ingenting på "motion"? Se på SQL'en.
- Hvorfor finder MySQL "billig kaffe", men ikke "kaffe billig"? Prøv det.
- Qdrant finder sider, hvor ingen af ordene står. **Hvordan kan den det?** Det er resten af dagen.

---

## Del 2: Betydning som tal (30 min)

### På papir, i par

Tegn et koordinatsystem med to akser:

- **x:** "noget man drikker" (0 = slet ikke, 10 = helt sikkert)
- **y:** "noget med motion" (0 = slet ikke, 10 = helt sikkert)

Sæt de her ord ind som punkter: **kaffe, espresso, te, løb, yoga, elregning**.

- Hvilke punkter ligger tæt på hinanden?
- Hvor ligger "elregning"?
- Sæt et nyt ord ind: **cappuccino**. Hvilket ord ligger det tættest på?

**Det I lige har lavet, er en embedding.** Hvert ord er blevet til to tal, fx kaffe = `[9, 1]`. Ord, der betyder noget lignende, ligger tæt på hinanden. Og at **søge** er bare at spørge: *Hvilke punkter ligger tættest på det her?*

### Fra 2 tal til 384 tal

En rigtig **embedding-model** gør det samme, men:

- med **384 tal** i stedet for 2, altså 384 akser i stedet for kun "drikke" og "motion"
- for hele sætninger, ikke kun ord
- og ingen har valgt akserne. Modellen har selv lært dem ved at læse enorme mængder tekst.

Hvor tæt to tekster er, måles med **cosine similarity**: Peger de to pile i samme retning? `1` betyder præcis samme retning, og jo lavere tallet er, jo mindre har de med hinanden at gøre.

En **vektordatabase** er en database, der er bygget til ét spørgsmål: *Hvilke punkter ligger tættest på det her?* Og den kan svare hurtigt, også når der er millioner af punkter.

---

## Del 3: Kig ind i vektorsøgningen (30 min)

Søg på "kaffe" igen, og følg de fire trin i højre side:

1. **Søgeteksten** får `query: ` foran. Hvorfor tror I, modellen vil vide, at det er en søgning?
2. **Embedding-modellen** laver teksten om til 384 tal. Striben viser dem: én tynd streg pr. tal, orange for positive og blå for negative.
3. **Qdrant** får de 384 tal og svarer med de 5 nærmeste punkter. Se request'en: Der står ingen tekst i den, kun tal.
4. **MySQL** leverer selve siderne. Qdrant kender kun id'er.

Sammenlign striben for jeres søgning med striberne under resultaterne. Kan I se, at de øverste ligner mest?

**Åbn Qdrant-dashboardet** på <http://localhost:6333/dashboard> → **Collections** → `pages`:

- Hvor mange punkter er der? Passer det med antallet af sider i MySQL?
- Åbn et punkt. Hvad er gemt ud over de 384 tal?

**Søg på "rumfart".** Ingen af siderne handler om rumfart.

- Får I alligevel 5 svar?
- Hvad er `score` nu, sammenlignet med "kaffe"?

> **Vigtigt:** En vektordatabase finder *altid* de nærmeste punkter, også selvom de ligger langt væk. Den siger aldrig "ingen resultater" af sig selv. Det er jeres job at bestemme, hvornår en `score` er for lav.

---

## Pause (15 min)

---

## Del 4: Koden og arkitekturen (45 min)

### Læs koden (15 min)

Backend har tre lag (se [`example-search-engine/README.md`](example-search-engine/README.md)). Åbn `application/searchService.js` først, og svar i jeres par:

- **Hvor bliver teksten lavet om til tal?** Find stedet. Hvilket lag ligger det i?
- Når en side gemmes (`addPage`): Hvilken database skrives der til først? Hvorfor i den rækkefølge?
- Qdrant svarer med id'er. Hvorfor gemmer vi så ikke hele siden i Qdrant?
- Hvad sker der i `ready()`, når backend starter?

### Byg videre (30 min)

1. **Tilføj en side** nederst på søgemaskinen, fx om grøn smoothie eller cykelferie. Søg efter den med ord, der ikke står i den. Bliver den fundet med det samme? Hvad sker der i koden, når I trykker **Gem**?
2. **Sæt en grænse:** Lav søgningen på "rumfart" om, så den ikke giver svar. Tilføj `score_threshold` i Qdrant-request'en i `pagesVectorRepository.query()`, og find selv en god værdi. **Arkitekturspørgsmål:** Grænsen er en regel for søgemaskinen. Hører den så hjemme i persistence-laget, eller burde application-laget bestemme værdien?
3. **Ødelæg det:**
   - `docker compose stop qdrant`. Søg. Hvad virker stadig?
   - Tilføj en side. Bliver den gemt? Kan den findes på betydning?
   - `docker compose start qdrant` og `docker compose restart backend`. Kan siden findes nu? Hvorfor? (Se `ready()`.)

Pointen med 3: **Vektordatabasen kan altid bygges op igen ud fra MySQL.** Derfor er MySQL sandhedskilden, og Qdrant er "bare" en søgeindgang.

---

## Del 5: Hvor bruges det? (15 min)

- **"Chat med jeres dokumenter"** (RAG): Find de 3 tekster, der ligger tættest på spørgsmålet, og giv dem til en sprogmodel sammen med spørgsmålet. Det er sådan, en supportbot kan svare ud fra en manual.
- **Anbefalinger:** "Andre sider/produkter/film, der ligner denne."
- **Billedsøgning:** Den samme idé virker med billeder. Et billede kan også laves om til tal.

Andre måder at gøre det på:

- **ChromaDB** gør det samme som vores eksempel: Modellen kører i klientbiblioteket, og man sender bare tekst.
- **Qdrant Cloud** og andre skytjenester kan lave embeddingen *inde i databasen*. Så sender man også bare tekst.
- **pgvector** lægger vektorsøgning ind i Postgres. Så er der kun én database.
- **Modellen er et valg:** Vi bruger en lille *flersproget* model, fordi siderne er på dansk. Den er hurtig og gratis, men ikke klog. Søg på "rumfart" efter at have tilføjet en side om raketter: En større model ville forstå sammenhængen bedre.

Tilbage til dagens spørgsmål: **Hvordan kan en database finde siden om løb, når I søger på "motion"?**

---

## Efter timen

Skriv fem linjer i jeres semesternotesbog: Forklar med egne ord, og uden ordet "AI", hvorfor Qdrant kan finde siden om løb, når I søger på "motion".

---

## Optional

- [optional] Qdrant: [What is a vector database?](https://qdrant.tech/articles/what-is-a-vector-database/)
- [optional] Hugging Face: [`multilingual-e5-small`](https://huggingface.co/intfloat/multilingual-e5-small), den model vi bruger
- [optional] `pgvector`: [README](https://github.com/pgvector/pgvector)
