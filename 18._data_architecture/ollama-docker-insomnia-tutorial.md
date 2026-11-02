# Tutorial: Embeddings med Ollama i Docker og Insomnia

I denne tutorial kører du en embedding-model lokalt i Docker og kalder den fra Insomnia. Når du sender en tekst til modellen, får du en vektor tilbage: en lang liste af tal, der repræsenterer tekstens betydning.

Alt er gratis og kører på din egen maskine. Du skal ikke bruge konti eller API-nøgler.

---

## Forudsætninger

- **Docker Desktop** installeret og startet ([docker.com](https://www.docker.com/products/docker-desktop/))
- **Insomnia** installeret ([insomnia.rest](https://insomnia.rest/download))
- Ca. 10 GB ledig diskplads. Selve Ollama-imaget fylder omkring 8 GB, fordi det indeholder biblioteker til GPU-understøttelse. Modellerne kommer oveni.

Tjek at Docker kører:

```bash
docker --version
```

---

## Del 1: Start Ollama i Docker

### 1.1 Start containeren

```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
```

Første gang hentes imaget, hvilket kan tage et stykke tid.

Hvad betyder det?

| Del | Betydning |
|---|---|
| `-d` | Kør i baggrunden |
| `-p 11434:11434` | Gør Ollamas API tilgængeligt på `localhost:11434` |
| `--name ollama` | Giv containeren et navn, så vi nemt kan referere til den |
| `ollama/ollama` | Det officielle Ollama-image |

### 1.2 Tjek at den kører

```bash
docker ps
```

Du skal kunne se en container med navnet `ollama`.

Du kan også åbne `http://localhost:11434` i browseren. Der skal stå **"Ollama is running"**.

### 1.3 Hent en embedding-model

```bash
docker exec ollama ollama pull nomic-embed-text
```

Vent til download er færdig (ca. 270 MB). Tjek derefter, at modellen er der:

```bash
docker exec ollama ollama list
```

`nomic-embed-text:latest` skal stå på listen.

### Valg af model

| Model | Dimensioner | Bemærkning |
|---|---|---|
| `all-minilm` | 384 | Meget lille og hurtig |
| `nomic-embed-text` | 768 | God standard, mest til engelsk |
| `bge-m3` | 1024 | Flersproget, bedst til dansk tekst |

Skriver du på dansk, så hent også `bge-m3`:

```bash
docker exec ollama ollama pull bge-m3
```

---

## Del 2: Kald API'et fra Insomnia

### 2.1 Opret en request

1. Åbn Insomnia.
2. Opret en ny **HTTP Request**.
3. Vælg metoden **POST**.
4. Indtast URL'en:

   ```
   http://localhost:11434/api/embed
   ```

5. Vælg fanen **Body** og vælg **JSON**.
6. Indsæt:

   ```json
   {
     "model": "nomic-embed-text",
     "input": "Hej verden"
   }
   ```

7. Klik **Send**.

### 2.2 Svaret

Du får et svar, der ligner dette (forkortet):

```json
{
  "model": "nomic-embed-text",
  "embeddings": [
    [0.0123, -0.0456, 0.0789, ...]
  ],
  "total_duration": 52000000,
  "load_duration": 1200000,
  "prompt_eval_count": 4
}
```

- `embeddings` er en liste af vektorer, én pr. input-tekst.
- Hver vektor har 768 tal for `nomic-embed-text`.

**Observation:** Den korte sætning "Hej verden" og en lang sætning giver begge en vektor med præcis 768 tal. Vektorens længde afhænger af modellen, ikke af teksten.

### 2.3 Flere tekster på én gang

Skift body til:

```json
{
  "model": "nomic-embed-text",
  "input": ["kat", "hund", "bil"]
}
```

Nu får du tre vektorer tilbage i `embeddings`, i samme rækkefølge som input.

### 2.4 Se hvilke modeller der er installeret

Opret en ny request:

- Metode: **GET**
- URL: `http://localhost:11434/api/tags`

Svaret viser alle modeller, som Ollama-instansen har hentet.

---

## Nyttige kommandoer

| Kommando | Formål |
|---|---|
| `docker start ollama` | Start containeren igen |
| `docker stop ollama` | Stop containeren |
| `docker logs ollama` | Se log fra Ollama |
| `docker exec ollama ollama list` | Vis installerede modeller |
| `docker exec ollama ollama pull <model>` | Hent en model |
| `docker exec ollama ollama rm <model>` | Slet en model |
| `docker rm -f ollama` | Slet containeren (modellerne slettes også) |
| `docker rmi ollama/ollama` | Slet imaget og frigør ca. 8 GB |
