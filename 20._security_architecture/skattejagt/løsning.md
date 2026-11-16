# Løsning: Runde 3 · Skattejagt

| # | Hvad | Hvor | Hvem kan se den |
|---|------|------|-----------------|
| 1 | MongoDB-password `Kaffekop2026` | `docker-compose.yml`, to steder (`MONGO_URL` og `MONGO_INITDB_ROOT_PASSWORD`) | Alle med adgang til repoet |
| 2 | Mail-password `Vinter-Ski-4417` | **Kun i historikken:** `.env` i commit *"Send mail ved nye noter"*, slettet i den næste commit | Alle med adgang til repoet, også efter sletningen (`git log -p`, `git show <commit>:.env`) |
| 3 | Betalings-API-nøgle `pk_notes_8c41f0e2b97d4a6e` | `ENV` i `backend/Dockerfile` | Alle med repoet, **og** alle med Docker-imaget (`docker history`, `docker inspect`) |
| 4 | Admin-token `adm_f3e9a1c07b2d58e4` | `frontend/app.js` | **Alle brugere af hjemmesiden** (Vis kilde / DevTools). Frontend kan aldrig holde på en *secret* |
| 5 | Deploy-password `Sommerhus-88` | URL i `README.md` (`https://deploy:Sommerhus-88@…`) | Alle med adgang til repoet |

## Sådan finder man dem

```bash
git grep -n -i -E "password|token|key|://[^/]+:[^@]+@"   # nr. 1, 3, 4 og 5 i filerne nu
git log --oneline --stat                                  # .env er tilføjet og slettet igen
git log -p -- .env                                        # nr. 2 i historikken
git show HEAD~4:.env                                      # eller vis filen fra den commit
```

**Ikke en *secret*:** `.env.example` har kun navnene uden værdier. Godt at spørge til, om de tæller den med.

## Gode spørgsmål bagefter

- Hvilken er værst? (Nr. 4: den ligger hos alle brugere, ikke kun i repoet.)
- Hvilken kan I ikke fjerne med en ny commit? (Nr. 2: den skal tilbagekaldes.)
- Nr. 3: Hjælper det at fjerne `ENV` fra `Dockerfile`, når imaget allerede er pushet?
