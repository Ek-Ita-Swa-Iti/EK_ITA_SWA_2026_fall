#!/usr/bin/env bash
# Laver repoet til skattejagten i session 20: en lille notes-app med 5 gemte secrets.
# Kør: bash lav-repo.sh    → laver mappen skattejagt-repo/ her, hvor du står.
# Alle secrets er opdigtede og virker ingen steder.
set -euo pipefail

DIR="skattejagt-repo"
if [ -e "$DIR" ]; then
  echo "Mappen $DIR findes allerede. Slet den først: rm -rf $DIR" >&2
  exit 1
fi

mkdir "$DIR" && cd "$DIR"
git init -q -b main

commit() { # commit <dato> <besked>
  git add -A
  GIT_AUTHOR_NAME="Sofie" GIT_AUTHOR_EMAIL="sofie@example.com" GIT_AUTHOR_DATE="$1" \
  GIT_COMMITTER_NAME="Sofie" GIT_COMMITTER_EMAIL="sofie@example.com" GIT_COMMITTER_DATE="$1" \
    git -c commit.gpgsign=false commit -q -m "$2"
}

# --- Commit 1: backend og compose ---------------------------------------
mkdir -p backend frontend
cat > backend/server.js <<'EOF'
const http = require("http");
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL);

http.createServer(async (req, res) => {
  const notes = await client.db("notes").collection("notes").find().toArray();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(notes));
}).listen(3000);
EOF

cat > backend/package.json <<'EOF'
{
  "name": "notes-backend",
  "private": true,
  "dependencies": {
    "mongodb": "^6.10.0"
  }
}
EOF

cat > backend/Dockerfile <<'EOF'
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
EOF

cat > docker-compose.yml <<'EOF'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      MONGO_URL: mongodb://notes:Kaffekop2026@mongo:27017

  mongo:
    image: mongo:8
    environment:
      MONGO_INITDB_ROOT_USERNAME: notes
      MONGO_INITDB_ROOT_PASSWORD: Kaffekop2026
EOF

cat > .env.example <<'EOF'
MAIL_USER=
MAIL_PASSWORD=
EOF
commit "2026-11-02T10:12:00+01:00" "Backend med MongoDB"

# --- Commit 2: mail via .env (ups, .env kom med) ------------------------
cat > .env <<'EOF'
MAIL_USER=notes-app@example.com
MAIL_PASSWORD=Vinter-Ski-4417
EOF
cat >> backend/server.js <<'EOF'

// Mail ved nye noter: MAIL_USER og MAIL_PASSWORD kommer fra .env
EOF
commit "2026-11-03T14:40:00+01:00" "Send mail ved nye noter"

# --- Commit 3: fjern .env igen ------------------------------------------
git rm -q --cached .env
rm .env
echo ".env" > .gitignore
commit "2026-11-03T14:52:00+01:00" "Fjern .env og tilføj .gitignore"

# --- Commit 4: betalings-API i Dockerfile --------------------------------
cat > backend/Dockerfile <<'EOF'
FROM node:20-slim
WORKDIR /app
ENV PAYMENT_API_KEY=pk_notes_8c41f0e2b97d4a6e
COPY . .
RUN npm install
CMD ["node", "server.js"]
EOF
commit "2026-11-05T09:05:00+01:00" "Betaling for premium-noter"

# --- Commit 5: frontend med admin-token ----------------------------------
cat > frontend/app.js <<'EOF'
const BACKEND_URL = "http://localhost:3000";
const ADMIN_TOKEN = "adm_f3e9a1c07b2d58e4"; // så admin-knappen virker

async function deleteAll() {
  await fetch(`${BACKEND_URL}/v1/notes`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
}
EOF
cat > frontend/index.html <<'EOF'
<!doctype html>
<html lang="da">
  <head><meta charset="utf-8"><title>Notes</title></head>
  <body>
    <h1>Notes</h1>
    <button onclick="deleteAll()">Slet alle noter (admin)</button>
    <script src="app.js"></script>
  </body>
</html>
EOF
commit "2026-11-06T11:30:00+01:00" "Admin-knap i frontend"

# --- Commit 6: README med deploy-URL -------------------------------------
cat > README.md <<'EOF'
# notes-app

Start lokalt:

```bash
cp .env.example .env   # udfyld værdierne
docker compose up -d --build
```

## Deploy

Deploy til serveren ved at kalde webhooket:

```bash
curl -X POST https://deploy:Sommerhus-88@deploy.notes-app.example.com/hook
```
EOF
commit "2026-11-07T16:20:00+01:00" "README med start og deploy"

echo "Klar: cd $DIR"
echo "Find alle 5 secrets. Husk at kigge i historikken."
