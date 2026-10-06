// Persistence layer backed by a remote JSON API — the Session 9, Part 2a swap.
//
// Same three-function contract as notesRepository.js: findAll, findById,
// create, all async, same note shape ({ id, title, body }). server.js only
// needs its require(...) line changed to point here — nothing else.
//
// Datasource: https://jsonplaceholder.typicode.com/posts — a free fake REST
// API. Its posts are already { id, title, body } plus a userId we don't need,
// so the only mapping is dropping that field. It's fake: POST /posts is
// accepted and echoed back with a new id, but nothing is actually stored on
// their end — call findAll() again and the "created" note won't be there.
// That's a property of the demo API, not a bug in this file.

const API_URL = "https://jsonplaceholder.typicode.com/posts";

function toNote(post) {
  return { id: post.id, title: post.title, body: post.body };
}

async function findAll() {
  const res = await fetch(API_URL);
  const posts = await res.json();
  return posts.map(toNote);
}

async function findById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (res.status === 404) return null;
  return toNote(await res.json());
}

async function create(title, body) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });
  return toNote(await res.json());
}

module.exports = { findAll, findById, create };
