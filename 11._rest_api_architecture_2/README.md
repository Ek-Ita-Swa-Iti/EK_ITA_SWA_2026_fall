# Session 11: Når andre afhænger af dit API

**ITA Software Architecture 2026 Fall**

> I dag bygger I ikke et API. I lader andre bruge det, og så ændrer I det.
> Det er dér, man finder ud af, hvad et API egentlig lover.

---

## Dagens spørgsmål

**AI kan ændre et API på 30 sekunder. Hvorfor er det så stadig dyrt at ændre et API?**

Det skal I kunne svare på, når I går hjem. Ikke fordi I har læst svaret, men fordi I har prøvet det.

---

## Læringsmål

Efter i dag kan du:

- forklare, hvad en **API-kontrakt** er, og hvorfor den er en arkitekturbeslutning
- skrive en kontrakt ned som **OpenAPI** og tjekke, om den passer med virkeligheden
- skelne mellem en **breaking** og en **non-breaking** ændring
- ændre et API uden at ødelægge dem, der bruger det (versionering, *tilføj, fjern ikke*)
- vurdere, om et API's **fejlsvar** er til at bruge for en klient

---

## Før timen

- Hav jeres **notes-service fra session 9** klar og kørende (`docker compose up`). Det er jeres API i dag. Hvis jeres version ikke virker, så brug eksemplet i `09._Layered_architecture_hands_on/example-node`.
- Sørg for, at jeres version ligger på **GitHub**, og at repoet er offentligt eller delt med holdet.
- Hav jeres AI-agent klar. I må bruge den til alt i dag.
- Hent Swagger UI på forhånd, så vi ikke venter på downloads: `docker pull swaggerapi/swagger-ui`

---

## Sådan er I sat sammen

I arbejder i **par**, og to par danner en **gruppe**. Hvert par har to roller på samme tid:

- **API-ejer:** I ejer jeres egen notes-service.
- **Klient:** I bygger noget, der bruger det andet pars API.

Par A bruger Par B's API, og Par B bruger Par A's.

**Én regel gælder hele dagen: Som klient må I ikke åbne det andet pars kode.** I må bruge `curl`, prøve jer frem og spørge ejerne. Præcis som hvis API'et tilhørte en anden virksomhed.

---

## Del 1: Demo · Det tog 30 sekunder (15 min)

Underviseren kører notes-servicen og et lille klient-script, der viser noterne. Alt virker.

Så kommer en ny udvikler ind og synes, at feltet `body` er et dårligt navn. Underviseren beder AI'en omdøbe det til `content`. Det tager et halvt minut, koden er pæn, og servicens egen frontend er også opdateret.

Så kører klient-scriptet igen.

**Diskutér i plenum:**
- Hvad gik galt? Var ændringen forkert?
- Hvem opdagede fejlen, og hvornår?
- Hvad ville det koste, hvis klienten var en app på 10.000 telefoner?

---

## Del 2: Øvelse · Byg en klient mod et fremmed API (35 min)

**Opgave:** Byg en lille klient til det andet pars notes-API. Den skal kunne:

1. vise alle noter
2. vise én note ud fra dens id
3. oprette en ny note

Formen er valgfri: et script i Node eller Python, en simpel HTML-side eller et bash-script med `curl`. Brug gerne AI til at bygge den.

**Sådan får I API'et til at køre hos jer:**

```bash
git clone <det-andet-pars-repo>
cd <repo>/example-node        # eller hvor deres docker-compose.yml ligger
docker compose up
```

Kør deres API på jeres egen maskine. Kig ikke i koden, kun i `docker compose`-outputtet.

> Kan I nå hinanden over netværket (session 4), må I også kalde hinandens maskiner direkte. Men klassens wifi blokerer det tit, så `git clone` er planen.

**Mens I arbejder, skal I føre en spørgeliste.** Skriv hver eneste ting ned, som I skulle gætte eller spørge ejerne om. For eksempel: *Hvad hedder felterne? Er id et tal eller en tekst? Hvad sker der, hvis titlen mangler?*

Som API-ejere skal I svare, når det andet par spørger. Skriv også ned, hvad I blev spurgt om.

---

## Del 3: Opsamling · Spørgelisten er kontrakten (15 min)

Hver gruppe læser sin spørgeliste op. Underviseren samler dem på tavlen.

Alt det, der står på tavlen, er det, en klient skal vide for at kunne bruge et API uden at ringe til dem, der har lavet det. Det hedder en **kontrakt**. Den findes altid, men ofte kun i hovedet på den, der har skrevet koden.

**Snak:** Hvilke spørgsmål handlede om det, der virker (felter, URL'er, metoder), og hvilke handlede om det, der går galt (fejl, manglende data)?

---

## Pause (10 min)

---

## Del 4: Øvelse · Skriv kontrakten ned (30 min)

**Som API-ejere:** Skriv en **OpenAPI-specifikation** (`openapi.yaml`) for jeres eget API. Brug AI'en til første udkast. Den skal dække:

- alle endpoints, med metoder og felter
- mindst **ét fejlsvar** pr. endpoint, ikke kun det, der går godt
- en **version** i stien, fx `/v1/notes` (skal I så ændre koden? Beslut det selv)

Se den som dokumentation i Swagger UI:

```bash
docker run -p 8081:8080 -e SWAGGER_JSON=/spec/openapi.yaml -v "$(pwd)":/spec swaggerapi/swagger-ui
```

Åbn <http://localhost:8081>.

**Byt og tjek.** Giv jeres `openapi.yaml` til det andet par. Som klient skal I nu teste den mod virkeligheden med `curl`:

- Passer felterne?
- Er statuskoderne, som specifikationen siger?
- Kan I finde **mindst én uoverensstemmelse** mellem specifikationen og det, API'et faktisk gør?

AI'en skrev specifikationen hurtigt. Men har den ret? Og hvem opdager det, hvis den tager fejl?

---

## Del 5: Øvelse · Kunden har et ønske (35 min)

Hvert par trækker et **forandringskort** fra underviseren. Kortet er et krav fra kunden, som I skal lave i jeres API. Eksempler:

| # | Kundens ønske |
|:-:|---|
| 1 | "Feltet `body` skal hedde `content`. Det er det, vi kalder det i forretningen." |
| 2 | "Noter skal kunne have tags." |
| 3 | "Listen over noter er for lang. Vi vil have sider med 10 noter ad gangen." |
| 4 | "Id'er skal være UUID'er i stedet for tal. Det kræver vores nye database." |
| 5 | "Det skal være tilladt at oprette en note uden `body`." |
| 6 | "Fejlbeskeder skal have et fast format med en fejlkode, så vi kan oversætte dem." |
| 7 | "Hver note skal vise, hvornår den er oprettet." |
| 8 | "Man skal kunne slette noter." |

**Gang i den:**

1. **Forudsig først (5 min).** Før I rører koden: Vil ændringen ødelægge det andet pars klient? Skriv jeres gæt ned.
2. **Lav ændringen (15 min).** Brug AI. Opdatér også `openapi.yaml`. Push til GitHub.
3. **Sandhedens øjeblik (5 min).** Det andet par kører `git pull`, genstarter jeres API og kører deres klient. Virker den stadig?
4. **Hvis den gik i stykker (10 min).** Find en måde at levere kundens ønske på *uden* at ødelægge klienten. Nogle muligheder:
   - **Tilføj, fjern ikke:** send både `body` og `content` i en periode
   - **Ny version:** lad `/v1/` blive, som den er, og lav ændringen i `/v2/`
   - **Gør det valgfrit:** nye felter og parametre har en standardværdi

Skriv på jeres kort: **breaking eller non-breaking?** Og hvordan ville I levere den i virkeligheden?

---

## Del 6: Fejljagt · Kan man bruge jeres fejl til noget? (15 min)

Som klient: Prøv at ødelægge det andet pars API. Send

- en note uden titel
- ugyldig JSON
- et id, der ikke findes
- et id, der ikke er et tal
- en URL, der ikke findes
- en metode, API'et ikke kender (fx `DELETE`, hvis de ikke har lavet det)

For hvert svar: **Hvilken statuskode fik I? Kunne jeres klient gøre noget fornuftigt med svaret?** Eller skulle I bare vise "Noget gik galt"?

Giv det andet par jeres tre bedste fund. Står de i deres `openapi.yaml`?

---

## Del 7: Afrunding · Hvad var dyrt? (15 min)

På tavlen laver vi to kolonner:

| Det var nemt | Det var dyrt |
|---|---|
| | |

Hver gruppe sætter post-its op ud fra dagens oplevelser.

Tilbage til dagens spørgsmål: **AI kan ændre et API på 30 sekunder. Hvorfor er det så stadig dyrt?** Passer jeres oplevelse med det? Eller var ændringerne i virkeligheden nemme hele vejen igennem?

**Sådan gør de andre (5 min).** Underviseren viser kort, hvordan Gitea håndterer det samme problem: versionen står i stien (`/api/v1/`), og specifikationen bliver genereret ud fra koden. Hvis en udvikler ændrer et endpoint uden at opdatere specifikationen, går builden i stykker. Samme problem som i dag, løst med værktøjer.

---

## Efter timen

Skriv **5 linjer** i din semester-notesbog:

1. Hvilken ændring lavede I, og gik den andet pars klient i stykker?
2. Hvad ville du gøre anderledes, hvis dit API havde 1.000 brugere?
3. Én ting, du ikke vidste i morges.

Gem `openapi.yaml`. I skal bruge den i projektet (session 14-17).

---

## Hvis du vil vide mere

- [valgfrit] Gitea's live API-dokumentation: kør Gitea i Docker og åbn `/api/swagger`. Find en `// swagger:operation`-kommentar i `routers/api/v1/` og sammenlign.
- [valgfrit] *RFC 9457: Problem Details for HTTP APIs.* Et standardformat for fejlsvar (afløser RFC 7807).
- [valgfrit] Zalando, *RESTful API Guidelines.* Læs afsnittene om versionering og kompatibilitet.
