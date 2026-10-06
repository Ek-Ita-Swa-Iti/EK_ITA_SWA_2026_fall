# Session 12: Skriv kontrakten ned · OpenAPI

**ITA Software Architecture 2026 Fall**

Vi starter dagen med at gennemgå resultaterne af [evalueringerne](evalueringer.md).

> Vi bygger videre på [session 11](../11._rest_api_architecture_2/README.md): samme par, samme notes-service.
>
> Sidst skrev I en spørgeliste over alt det, I måtte gætte jer til eller spørge ejerne om, før I kunne bruge det andet pars API. Den liste *er* kontrakten. Indtil nu har den kun fandtes på papir og i hovedet på dem, der skrev koden. I dag skriver I den ned som en OpenAPI-specifikation.

---

## Læringsmål

Efter i dag kan du:

- skrive en kontrakt ned som en **OpenAPI-specifikation** og tjekke, om den passer med virkeligheden

---

## Før timen

- Hav jeres **notes-service** fra session 11 klar og kørende (`docker compose up`).
- Tag jeres **spørgeliste** fra session 11 med.
- Hent Swagger UI hjemmefra, så vi ikke venter på downloads i timen: `docker pull swaggerapi/swagger-ui`

---

## Del 1: Øvelse · Skriv kontrakten ned (30 min)

**Som API-ejere:** Beskriv jeres eget API i en **OpenAPI-specifikation**, en fil der hedder `swagger.json`. Lad gerne AI'en skrive den. Specifikationen skal have:

- alle endpoints, med metoder og felter
- mindst **ét fejlsvar** pr. endpoint: hvad sker der, når noget går galt?
- en **version** i stien, fx `/v1/notes`. Skal koden så også ændres? Det beslutter I selv
- en `servers`-linje, der peger på jeres API: `"servers": [{ "url": "http://localhost:3000" }]`

<hr>

<img src="images/swagger-ui.png" align="right" width="50%" alt="Swagger UI viser Notes API med fem endpoints: GET og POST på /v1/notes samt GET, PUT og DELETE på /v1/notes/{id}, hver med en farvet metode-knap.">

**Se jeres specifikation som dokumentation.** Det gør I med **Swagger UI**. Værktøjet læser `swagger.json` og viser alle jeres endpoints som dokumentation, man kan klikke rundt i. Det kører i Docker ved siden af jeres API. Læg `swagger.json` i en ny mappe `spec/`, og tilføj Swagger UI som en service i `docker-compose.yml`:

<br clear="right">

<hr>

```
notes-service/
├── backend/
│   ├── Dockerfile
│   └── src/
├── frontend/
├── spec/
│   └── swagger.json      ← ny
└── docker-compose.yml
```

```yaml
  swagger-ui:
    image: swaggerapi/swagger-ui
    ports:
      - "8081:8080"
    environment:
      SWAGGER_JSON: /spec/swagger.json
    volumes:
      - ./spec:/spec:ro
```

Kør `docker compose up`, og åbn <http://localhost:8081>. Retter I i `spec/swagger.json`, skal I bare genindlæse siden.

> Virker Docker ikke, så indsæt indholdet af `swagger.json` i **Swagger Editor** på <https://editor.swagger.io/>. Den viser den samme dokumentation i højre side.

**Byt og tjek.** Byt `swagger.json` med det andet par. Nu er I klienter og tester deres specifikation mod deres kørende API i **Insomnia**. Importér `swagger.json` direkte i Insomnia, så står alle requests klar:

- Passer felterne?
- Får I de statuskoder, som specifikationen lover?
- Find **mindst ét sted**, hvor specifikationen og API'et ikke siger det samme.

AI'en skrev specifikationen på få sekunder. Men passer den? Og hvem opdager det, hvis den ikke gør?

---

## Del 2: Sådan gør de andre

Demo: GitHub beskriver selv api.github.com, det API I brugte i session 10 og 11, i en OpenAPI-specifikation: [`api.github.com.json`](https://github.com/github/rest-api-description/blob/main/descriptions/api.github.com/api.github.com.json).

Andre kendte API'er, der også offentliggør deres specifikation:

- **DMI** (vejrdata): DMI's API til vejrobservationer kører live i Swagger UI, ligesom jeres egen: <https://opendataapi.dmi.dk/v2/metObs/api>
- **Discord**: [`discord/discord-api-spec`](https://github.com/discord/discord-api-spec/blob/main/specs/openapi.json)
- **OpenAI** (API'et bag ChatGPT): [`openai/openai-openapi`](https://github.com/openai/openai-openapi/blob/main/openapi.yaml)
- **Mistral AI** (europæisk AI, bag Le Chat): [`openapi.yaml`](https://docs.mistral.ai/openapi.yaml)

---

## Efter timen

Gem `swagger.json`. I skal bruge den igen i projektet i session 14-17.
