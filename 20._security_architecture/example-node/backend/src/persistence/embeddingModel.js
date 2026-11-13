// Persistence layer: Ollama laver tekst om til tal (en embedding).
// Ollama er en anden container, så vi kalder den over HTTP ved servicenavn.

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama:11434";
const MODEL = "bge-m3";
const DIMENSIONS = 1024; // bge-m3 laver altid 1024 tal

async function embed(text) {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`Ollama svarede ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.embeddings[0];
}

module.exports = { embed, DIMENSIONS };
