# Session 12: Skriv kontrakten ned · OpenAPI

**ITA Software Architecture 2026 Fall**

> Vi bygger videre på [session 11](../11._rest_api_architecture_2/README.md): samme par, samme notes-service.

---

## Læringsmål

Efter i dag kan du:

- skrive en kontrakt ned som en **OpenAPI-specifikation** og tjekke, om den passer med virkeligheden

---

## Før timen

- Hav jeres **notes-service** fra session 11 klar og kørende (`docker compose up`).
- Hent Swagger UI på forhånd, så vi ikke venter på downloads: `docker pull swaggerapi/swagger-ui`

---

## Del 1: Øvelse · Skriv kontrakten ned (30 min)

**Som API-ejere:** Skriv eller generér en **OpenAPI-specifikation** (`swagger.json`) for jeres eget API. Brug AI'en til første udkast. Den skal dække:

- alle endpoints, med metoder og felter
- mindst **ét fejlsvar** pr. endpoint, ikke kun det, der går godt
- en **version** i stien, fx `/v1/notes` (skal I så ændre koden? Beslut det selv)
- en `servers`-linje, der peger på jeres API: `"servers": [{ "url": "http://localhost:3000" }]`

Se den som dokumentation i Swagger UI. Læg `swagger.json` i en mappe `spec/` ved siden af jeres `docker-compose.yml`, og tilføj Swagger UI som en service i filen:

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

Kør `docker compose up`, og åbn <http://localhost:8081>. Når I retter i `spec/swagger.json`, skal I bare genindlæse siden.

**Byt og tjek.** Giv jeres `swagger.json` til det andet par. Som klient skal I nu teste den mod virkeligheden med **Insomnia**. I kan importere `swagger.json` direkte i Insomnia, så har I alle requests klar:

- Passer felterne?
- Er statuskoderne, som specifikationen siger?
- Kan I finde **mindst én uoverensstemmelse** mellem specifikationen og det, API'et faktisk gør?

AI'en skrev specifikationen hurtigt. Men har den ret? Og hvem opdager det, hvis den tager fejl?

---

## Del 2: Sådan gør de andre

Demo: GitHubs egen OpenAPI-specifikation af api.github.com, det API I brugte i session 10 og 11: [`api.github.com.json`](https://github.com/github/rest-api-description/blob/main/descriptions/api.github.com/api.github.com.json).

Flere kendte API'er, der offentliggør deres OpenAPI-specifikation:

- **Stripe** (betalinger): [`stripe/openapi`](https://github.com/stripe/openapi/blob/master/openapi/spec3.json)
- **Twilio** (SMS og telefoni): [`twilio/twilio-oai`](https://github.com/twilio/twilio-oai/blob/main/spec/json/twilio_api_v2010.json)
- **DigitalOcean** (cloud-hosting): [`digitalocean/openapi`](https://github.com/digitalocean/openapi/blob/main/specification/DigitalOcean-public.v2.yaml)
- **Kubernetes**: [`api/openapi-spec/swagger.json`](https://github.com/kubernetes/kubernetes/blob/master/api/openapi-spec/swagger.json)
- **Swagger Petstore**, det klassiske eksempel, som kører live i Swagger UI: <https://petstore3.swagger.io/>
- **APIs.guru**, et katalog med tusindvis af offentlige specifikationer: <https://apis.guru/>

---

## Efter timen

Gem `swagger.json`. I skal bruge den i projektet (session 14-17).
