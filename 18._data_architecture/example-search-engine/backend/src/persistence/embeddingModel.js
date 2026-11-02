// The embedding model: turns a text into 384 numbers.
//
// It runs right here, inside the backend — no API key, no account, no extra
// container. multilingual-e5-small understands Danish, and texts that mean
// the same thing get numbers that point in the same direction.
//
// Run this file directly (node embeddingModel.js) to download the model.
// The Dockerfile does that when the image is built.

const path = require("path");

const MODEL = "Xenova/multilingual-e5-small";
const DIMENSIONS = 384;
const CACHE_DIR = path.join(__dirname, "../../.models");

let extractor;

function load() {
  if (!extractor) {
    extractor = import("@huggingface/transformers").then(({ pipeline, env }) => {
      env.cacheDir = CACHE_DIR;
      // q8 = the quantised version of the model: ~120 MB instead of ~470 MB.
      return pipeline("feature-extraction", MODEL, { dtype: "q8" });
    });
  }
  return extractor;
}

// e5 models are trained to see "query: " in front of what you search for,
// and "passage: " in front of what you store. Callers add the prefix.
async function embed(text) {
  const [vector] = await embedMany([text]);
  return vector;
}

async function embedMany(texts) {
  const model = await load();
  // mean pooling + normalize: one vector per text, with length 1, so
  // cosine similarity is just "how much do the two arrows point the same way".
  const output = await model(texts, { pooling: "mean", normalize: true });
  return output.tolist();
}

module.exports = { MODEL, DIMENSIONS, embed, embedMany };

if (require.main === module) {
  embed("passage: test").then((vector) => {
    console.log(`Model ${MODEL} is ready: ${vector.length} numbers per text`);
  });
}
