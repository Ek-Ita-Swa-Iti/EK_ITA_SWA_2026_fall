// Presentation layer: checks the bearer token on requests that change notes.
// The token comes from the environment (NOTES_API_TOKEN, set from .env via
// docker-compose.yml) — never from the code.

const crypto = require("crypto");

const NOTES_API_TOKEN = process.env.NOTES_API_TOKEN;

if (!NOTES_API_TOKEN) {
  console.warn("NOTES_API_TOKEN er ikke sat: POST, PUT og DELETE bliver alle afvist med 401.");
}

// Compare as hashes: same length every time, and timingSafeEqual takes the
// same time whether the first or the last character is wrong.
function sameToken(given, expected) {
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function isAuthorized(req) {
  if (!NOTES_API_TOKEN) return false; // fail closed: no token configured, no writes
  const match = (req.headers.authorization || "").match(/^Bearer (.+)$/);
  return Boolean(match) && sameToken(match[1], NOTES_API_TOKEN);
}

module.exports = { isAuthorized };
