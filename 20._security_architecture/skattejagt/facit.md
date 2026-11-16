# Til underviseren: demo og facit

## Runde 1 · Demo: GitHub fanger et token

**Før timen**

1. Lav et offentligt test-repo, fx `s20-leak-demo`.
2. GitHub → *Settings* → *Developer settings* → *Personal access tokens* → **Fine-grained tokens** → *Generate new token*.
   - Udløb: 1 dag
   - Repository access: *Public repositories (read-only)*, ingen ekstra rettigheder
3. Prøv demoen én gang, så du ved, hvordan det ser ud.

**I timen**

```bash
echo "GITHUB_TOKEN=<tokenet>" > config.txt
git add config.txt && git commit -m "config"
git push
```

- **Push protection** afviser pushet og viser fil, linje og token-type. Vis det på skærmen.
- Fejlbeskeden har et link, hvor du kan tillade pushet. Gør det, og push igen.
- GitHub ser nu tokenet i et offentligt repo og tilbagekalder det. Vis på *Personal access tokens*, at det er væk, og find mailen fra GitHub.

Slet tokenet manuelt bagefter, hvis det ikke allerede er sket, og slet test-repoet.

---

## Runde 3 · Skattejagt: facit

| # | Hvad | Hvor | Hvem kan se den |
|---|------|------|-----------------|
| 1 | MongoDB-password `Kaffekop2026` | `docker-compose.yml`, to steder (`MONGO_URL` og `MONGO_INITDB_ROOT_PASSWORD`) | Alle med adgang til repoet |
| 2 | Mail-password `Vinter-Ski-4417` | **Kun i historikken:** `.env` i commit *"Send mail ved nye noter"*, slettet i den næste commit | Alle med adgang til repoet, også efter sletningen (`git log -p`, `git show <commit>:.env`) |
| 3 | Betalings-API-nøgle `pk_notes_8c41f0e2b97d4a6e` | `ENV` i `backend/Dockerfile` | Alle med repoet, **og** alle med Docker-imaget (`docker history`, `docker inspect`) |
| 4 | Admin-token `adm_f3e9a1c07b2d58e4` | `frontend/app.js` | **Alle brugere af hjemmesiden** (Vis kilde / DevTools). Frontend kan aldrig holde på en *secret* |
| 5 | Deploy-password `Sommerhus-88` | URL i `README.md` (`https://deploy:Sommerhus-88@…`) | Alle med adgang til repoet |

**Ikke en *secret*:** `.env.example` har kun navnene uden værdier. Godt at spørge til, om de tæller den med.

**Gode spørgsmål bagefter**

- Hvilken er værst? (Nr. 4: den ligger hos alle brugere, ikke kun i repoet.)
- Hvilken kan I ikke fjerne med en ny commit? (Nr. 2: den skal tilbagekaldes.)
- Nr. 3: Hjælper det at fjerne `ENV` fra `Dockerfile`, når imaget allerede er pushet?
