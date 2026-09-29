# Session 12: Skriv kontrakten ned · OpenAPI

**ITA Software Architecture 2026 Fall**

> Bygger videre på [session 11](../11._rest_api_architecture_2/README.md): samme par, samme notes-service.

---

## Læringsmål

Efter i dag kan du:

- skrive en kontrakt ned som **OpenAPI** og tjekke, om den passer med virkeligheden

---

## Før timen

- Hav jeres **notes-service** fra session 11 klar og kørende (`docker compose up`).
- Hent Swagger UI på forhånd, så vi ikke venter på downloads: `docker pull swaggerapi/swagger-ui`

---

## Del 1: Øvelse · Skriv kontrakten ned (30 min)

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

## Del 2: Sådan gør de andre

Underviseren viser kort, hvordan Gitea håndterer det samme problem: versionen står i stien (`/api/v1/`), og specifikationen bliver genereret ud fra koden. Hvis en udvikler ændrer et endpoint uden at opdatere specifikationen, går builden i stykker. Samme problem, løst med værktøjer.

---

## Efter timen

Gem `openapi.yaml`. I skal bruge den i projektet (session 14-17).
