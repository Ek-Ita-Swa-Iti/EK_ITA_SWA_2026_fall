# Session 21: Dokumentation · ADR'er og C4-modellen

**ITA Software Architecture 2026 Fall**

> Det meste arkitekturdokumentation er forkert, forældet eller begge dele. De to idéer i dag, **ADR'er** til at skrive beslutninger ned og **C4-modellen** til diagrammer i fire nyttige zoomniveauer, er praktiske, billige og holder, når de møder virkeligheden. Hvis I kun tager to dokumentationsvaner med jer, så tag de her.

---

## Læringsmål

Efter i dag kan du:

- skrive en **Architecture Decision Record (ADR)** for en rigtig beslutning
- tegne et system i C4-modellens fire niveauer: **Context, Container, Component, Code**
- skelne mellem dokumentation, der er værd at skrive, og dokumentation, der bare forældes

---

## Før timen

- Find **én** ADR i et offentligt GitHub-repo (prøv at søge efter mapper som `decisions/` eller `adr/`). Skim den, ca. 5 min.
- Find **ét** C4-diagram på nettet, og skriv ned, hvilket af de fire niveauer det er.

---

## Del 1: Hvorfor det meste arkitekturdokumentation fejler (15 min)

- Word-dokumenter, som ingen åbner.
- Wiki-sider, der glider væk fra koden.
- Viden, der kun findes i hovedet på nogen, og som forsvinder, når de går.

Løsningen er ikke *mere* dokumentation. Det er dokumentation, der er lille, versioneret og ligger tæt på koden.

---

## Del 2: ADR'er (60 min)

En Architecture Decision Record er en kort markdown-fil, der beskriver **én** beslutning. Opbygning:

- **Titel**
- **Status**: foreslået / accepteret / erstattet
- **Kontekst**: Hvilken situation tvinger os til at beslutte noget?
- **Beslutning**: Hvad besluttede vi?
- **Konsekvenser**: Hvad får vi ud af det, og hvad koster det?

Vi skriver én sammen på holdet, om en beslutning underviseren har truffet før.

Bagefter i par: skriv en ADR for en beslutning, I har truffet i session 9 eller 10–11. En halv side.

---

## Del 3: C4-modellen (60 min)

Simon Browns fire niveauer, fra langt væk til helt tæt på:

1. **Context**: systemet som én boks, med brugere og andre systemer udenfor. *Målgruppe: alle.*
2. **Container**: de dele, der kører hver for sig (webapp, API, database, kø). *Målgruppe: udviklere og drift.*
3. **Component**: de vigtigste moduler inde i én container. *Målgruppe: udviklerne på den container.*
4. **Code**: klasseniveau. *Målgruppe: sjældent nogen. Bliver som regel genereret automatisk.*

De fleste diagrammer, der ikke virker, prøver at være alle fire på én gang.

Live: Vi tegner et Context- og et Container-diagram for projektet fra session 14–17.

---

## Del 4: Det skal I ikke dokumentere (15 min)

- Dokumentér ikke det, koden allerede siger.
- Dokumentér ikke det, der er sandt i morgen, men ikke i næste uge.
- **Dokumentér**, hvorfor noget *ikke* er der. Fravalg bliver hurtigt glemt.

---

## Del 5: Workshop (30 min)

I par: Skriv to ADR'er mere for jeres projekt fra session 14–17. Pointen er at øve sig. Det er vigtigere at skrive mange end at skrive perfekte.

---

## Øvelse

Vælg en beslutning fra dit arbejde eller din fritid, som du har truffet uden at skrive den ned. Skriv ADR'en for den nu.

---

## Efter timen

- Det her er den sidste undervisningssession før eksamensprojektet (session 22–29).

---

## Referencer

- Nygard, M.: *Documenting Architecture Decisions* (den oprindelige artikel om ADR'er).
- Brown, S.: [c4model.com](https://c4model.com).
- Repoet *Architecture Decision Records* på GitHub.
