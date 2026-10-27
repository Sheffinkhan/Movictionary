import express from 'express';
import cors from 'cors';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSSequelize from '@adminjs/sequelize';
import { Op } from 'sequelize';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import openapi from './openapi.js';
import { initDb, Movie, Term, Review, Song, Update, PollOption, Subscriber } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const content = await initDb();

const app = express();
app.use(cors());

// Admin panel: mounted before express.json() because AdminJS parses its own bodies.
const { ADMIN_EMAIL, ADMIN_PASSWORD, COOKIE_SECRET } = process.env;
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  AdminJS.registerAdapter({ Resource: AdminJSSequelize.Resource, Database: AdminJSSequelize.Database });
  const admin = new AdminJS({
    rootPath: '/admin',
    branding: { companyName: 'Movictionary', withMadeWithLove: false },
    resources: [
      { resource: Movie, options: { navigation: 'Content', listProperties: ['id', 'title', 'year', 'genre', 'director'] } },
      { resource: Review, options: { navigation: 'Content', properties: { text: { type: 'textarea' } } } },
      { resource: Term, options: { navigation: 'Content', properties: { definition: { type: 'textarea' }, example: { type: 'textarea' } } } },
      { resource: Song, options: { navigation: 'Content' } },
      { resource: Update, options: { navigation: 'Content', properties: { text: { type: 'textarea' } } } },
      { resource: PollOption, options: { navigation: 'Community' } },
      { resource: Subscriber, options: { navigation: 'Community', actions: { new: { isAccessible: false } } } },
    ],
  });
  const secret = COOKIE_SECRET || 'change-me-in-production-please-32chars';
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => (email === ADMIN_EMAIL && password === ADMIN_PASSWORD ? { email } : null),
      cookieName: 'movictionary-admin',
      cookiePassword: secret,
    },
    null,
    { resave: false, saveUninitialized: false, secret },
  );
  app.use(admin.options.rootPath, adminRouter);
  console.log(`Admin panel:    http://localhost:${PORT}/admin`);
} else {
  console.log('Admin panel disabled: set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env');
}

app.use(express.json());

const norm = (s) => String(s || '').trim().toLowerCase();
const dayNumber = () => Math.floor(Date.now() / 864e5);
const plain = (rows) => rows.map((r) => r.get({ plain: true }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Movictionary API' }));
app.get('/api/openapi.json', (_req, res) => res.json(openapi));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const termOut = (t) => ({ t: t.term, p: t.pos, d: t.definition, e: t.example });

app.get('/api/terms', async (req, res) => {
  const q = norm(req.query.q);
  const letter = String(req.query.letter || '').toUpperCase();
  const where = {};
  if (letter) where.term = { [Op.like]: `${letter}%` };
  if (q) where[Op.or] = [{ term: { [Op.like]: `%${q}%` } }, { definition: { [Op.like]: `%${q}%` } }];
  const rows = await Term.findAll({ where, order: [['term', 'ASC']] });
  res.json(plain(rows).map(termOut));
});

app.get('/api/terms/today', async (_req, res) => {
  const rows = await Term.findAll({ order: [['id', 'ASC']] });
  res.json(rows.length ? termOut(plain(rows)[dayNumber() % rows.length]) : null);
});

// Movies: search, filter, sort and paginate the full Malayalam catalogue.
app.get('/api/movies', async (req, res) => {
  const q = norm(req.query.q);
  const { genre, decade, sort = 'newest' } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const where = {};
  if (q) where[Op.or] = [{ title: { [Op.like]: `%${q}%` } }, { director: { [Op.like]: `%${q}%` } }];
  if (genre && genre !== 'All') where.genre = genre;
  if (decade && decade !== 'All') where.year = { [Op.between]: [Number(decade), Number(decade) + 9] };
  const order = sort === 'oldest' ? [['year', 'ASC'], ['title', 'ASC']]
    : sort === 'title' ? [['title', 'ASC']] : [['year', 'DESC'], ['title', 'ASC']];
  const { rows, count } = await Movie.findAndCountAll({ where, order, limit, offset: (page - 1) * limit });
  const all = plain(await Movie.findAll({ attributes: ['genre', 'year'] }));
  const reviewed = new Set(plain(await Review.findAll({ attributes: ['title'] })).map((r) => norm(r.title)));
  res.json({
    total: count,
    page,
    pages: Math.max(Math.ceil(count / limit), 1),
    genres: [...new Set(all.map((m) => m.genre))].sort(),
    decades: [...new Set(all.map((m) => Math.floor(m.year / 10) * 10))].sort((a, b) => b - a),
    items: plain(rows).map((m) => ({ ...m, reviewed: reviewed.has(norm(m.title)) })),
  });
});

app.get('/api/movies/:id', async (req, res) => {
  const movie = await Movie.findByPk(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  const m = movie.get({ plain: true });
  const review = await Review.findOne({ where: { title: m.title } });
  const related = await Movie.findAll({
    where: { genre: m.genre, id: { [Op.ne]: m.id } }, order: [['year', 'DESC']], limit: 4,
  });
  res.json({ ...m, review: review ? review.get({ plain: true }) : null, related: plain(related) });
});

app.get('/api/reviews', async (req, res) => {
  const g = req.query.genre;
  const where = g && g !== 'All' ? { genre: g } : {};
  const reviews = plain(await Review.findAll({ where, order: [['id', 'ASC']] }));
  const movies = plain(await Movie.findAll({ attributes: ['id', 'title'] }));
  const ids = new Map(movies.map((m) => [norm(m.title), m.id]));
  res.json(reviews.map((r) => ({ t: r.title, g: r.genre, y: r.year, s: r.score, x: r.text, movieId: ids.get(norm(r.title)) || null })));
});

app.get('/api/songs', async (_req, res) => res.json(plain(await Song.findAll({ order: [['id', 'ASC']] }))));
app.get('/api/updates', async (_req, res) => {
  const rows = plain(await Update.findAll({ order: [['id', 'ASC']] }));
  res.json(rows.map((u) => ({ d: u.day, m: u.month, h: u.headline, p: u.text, tag: u.tag })));
});
app.get('/api/books', (_req, res) => res.json({ books: content.BOOKS, story: content.STORY }));
app.get('/api/tips', (_req, res) => res.json(content.TIPS));
app.get('/api/moods', (_req, res) => res.json(content.MOODS));

// Quiz: the answers never leave the server.
app.get('/api/quiz', (req, res) => {
  const n = content.QUIZ.length;
  const id = req.query.id !== undefined ? Number(req.query.id) % n : dayNumber() % n;
  const q = content.QUIZ[id];
  res.json({ id, emoji: q.e, hint: q.h, total: n });
});
app.post('/api/quiz/check', (req, res) => {
  const q = content.QUIZ[Number(req.body.id)];
  if (!q) return res.status(400).json({ error: 'Unknown clue' });
  const correct = q.a.includes(norm(req.body.guess));
  res.json({ correct, answer: correct ? q.a[0] : undefined });
});

const pollOut = async () => plain(await PollOption.findAll({ order: [['id', 'ASC']] })).map((p) => ({ label: p.label, votes: p.votes }));
app.get('/api/poll', async (_req, res) => res.json(await pollOut()));
app.post('/api/poll/vote', async (req, res) => {
  const options = await PollOption.findAll({ order: [['id', 'ASC']] });
  const option = options[Number(req.body.option)];
  if (!option) return res.status(400).json({ error: 'Invalid option' });
  await option.increment('votes');
  res.json(await pollOut());
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
    hashtags: `#${slug} #movictionary #malayalamcinema #mollywood #moviereview #filmlovers #whattowatch #moviedictionary`,
  });
});

app.post('/api/subscribe', async (req, res) => {
  const email = norm(req.body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }
  await Subscriber.findOrCreate({ where: { email } });
  res.json({ ok: true });
});

// In production the built React app is served from the same server.
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/(api|admin)).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Movictionary API on http://localhost:${PORT}`);
  console.log(`Swagger docs:   http://localhost:${PORT}/api/docs`);
});
