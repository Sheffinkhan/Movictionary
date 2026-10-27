import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'content.json'), 'utf8'));
const STORE = path.join(__dirname, 'data', 'store.json');
const PORT = process.env.PORT || 3001;

// Votes and subscribers live in a small JSON file so they survive restarts.
function readStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE, 'utf8'));
  } catch {
    return { votes: content.POLL.map((p) => p.votes), subscribers: [] };
  }
}
const writeStore = (s) => fs.writeFileSync(STORE, JSON.stringify(s, null, 2));

const app = express();
app.use(cors());
app.use(express.json());

const norm = (s) => String(s || '').trim().toLowerCase();
const dayNumber = () => Math.floor(Date.now() / 864e5);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Movictionary API' }));
app.get('/api/openapi.json', (_req, res) => res.json(openapi));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/terms', (req, res) => {
  const q = norm(req.query.q);
  const letter = String(req.query.letter || '').toUpperCase();
  let list = [...content.TERMS].sort((a, b) => a.t.localeCompare(b.t));
  if (letter) list = list.filter((t) => t.t[0].toUpperCase() === letter);
  if (q) list = list.filter((t) => t.t.toLowerCase().includes(q) || t.d.toLowerCase().includes(q));
  res.json(list);
});

app.get('/api/terms/today', (_req, res) => {
  res.json(content.TERMS[dayNumber() % content.TERMS.length]);
});

app.get('/api/reviews', (req, res) => {
  const g = req.query.genre;
  res.json(g && g !== 'All' ? content.REVIEWS.filter((r) => r.g === g) : content.REVIEWS);
});

app.get('/api/songs', (_req, res) => res.json(content.SONGS));
app.get('/api/updates', (_req, res) => res.json(content.UPDATES));
app.get('/api/books', (_req, res) => res.json({ books: content.BOOKS, story: content.STORY }));
app.get('/api/tips', (_req, res) => res.json(content.TIPS));
app.get('/api/moods', (_req, res) => res.json(content.MOODS));

// Quiz: the answers never leave the server.
app.get('/api/quiz', (req, res) => {
  const n = content.QUIZ.length;
  const id = req.query.id !== undefined ? Number(req.query.id) % n : dayNumber() % n;
  const q = content.QUIZ[id];
  res.json({ id, emoji: q.e, hint: q.h });
});
app.post('/api/quiz/check', (req, res) => {
  const q = content.QUIZ[Number(req.body.id)];
  if (!q) return res.status(400).json({ error: 'Unknown clue' });
  const correct = q.a.includes(norm(req.body.guess));
  res.json({ correct, answer: correct ? q.a[0] : undefined });
});

app.get('/api/poll', (_req, res) => {
  const { votes } = readStore();
  res.json(content.POLL.map((p, i) => ({ label: p.label, votes: votes[i] })));
});
app.post('/api/poll/vote', (req, res) => {
  const i = Number(req.body.option);
  if (!Number.isInteger(i) || i < 0 || i >= content.POLL.length) {
    return res.status(400).json({ error: 'Invalid option' });
  }
  const store = readStore();
  store.votes[i] += 1;
  writeStore(store);
  res.json(content.POLL.map((p, k) => ({ label: p.label, votes: store.votes[k] })));
});

app.post('/api/generate', (req, res) => {
  const movie = String(req.body.movie || '').trim().slice(0, 80);
  if (!movie) return res.status(400).json({ error: 'Movie name is required' });
  const slug = movie.replace(/[^a-z0-9]/gi, '');
  res.json({
    captions: [
      `${movie} deserves a second watch. Here's why 👇`,
      `One word that sums up ${movie}? Drop it below.`,
      `Movie term of the day from ${movie}: which scene fits it best?`,
    ],
    hashtags: `#${slug} #movictionary #moviereview #cinema #filmlovers #moviesofinstagram #whattowatch #moviedictionary`,
  });
});

app.post('/api/subscribe', (req, res) => {
  const email = norm(req.body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }
  const store = readStore();
  if (!store.subscribers.some((s) => s.email === email)) {
    store.subscribers.push({ email, at: new Date().toISOString() });
    writeStore(store);
  }
  res.json({ ok: true });
});

// In production the built React app is served from the same server.
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Movictionary API on http://localhost:${PORT}`);
  console.log(`Swagger docs:   http://localhost:${PORT}/api/docs`);
});
