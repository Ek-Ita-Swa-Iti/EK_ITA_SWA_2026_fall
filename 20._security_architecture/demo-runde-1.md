# Til underviseren: Runde 1 · Demo: GitHub fanger et token

## Før timen

1. Lav et offentligt test-repo, fx `s20-leak-demo`.
2. GitHub → *Settings* → *Developer settings* → *Personal access tokens* → **Fine-grained tokens** → *Generate new token*.
   - Udløb: 1 dag
   - Repository access: *Public repositories (read-only)*, ingen ekstra rettigheder
3. Prøv demoen én gang, så du ved, hvordan det ser ud.

## I timen

```bash
echo "GITHUB_TOKEN=<tokenet>" > config.txt
git add config.txt && git commit -m "config"
git push
```

- **Push protection** afviser pushet og viser fil, linje og token-type. Vis det på skærmen.
- Fejlbeskeden har et link, hvor du kan tillade pushet. Gør det, og push igen.
- GitHub ser nu tokenet i et offentligt repo og tilbagekalder det. Vis på *Personal access tokens*, at det er væk, og find mailen fra GitHub.

Slet tokenet manuelt bagefter, hvis det ikke allerede er sket, og slet test-repoet.
