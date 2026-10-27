# Movictionary

Malayalam cinema dictionary, movie catalogue, reviews, songs, updates, books, quiz, poll and creator tools.
React (Vite + React Router) frontend, Node.js (Express) API with SQLite, Swagger docs and an AdminJS panel.

## Run it

```bash
npm run install:all
cp server/.env.example server/.env   # then set ADMIN_EMAIL, ADMIN_PASSWORD, COOKIE_SECRET
npm run dev:server    # API on http://localhost:3001
npm run dev:client    # site on http://localhost:5173 (proxies /api to the API)
```

- Swagger UI: http://localhost:3001/api/docs
- Admin panel: http://localhost:3001/admin (sign in with the credentials from `server/.env`; disabled when they are not set)

## Production

```bash
npm run build         # builds client/dist
npm start             # Express serves the site, API and admin on :3001
```

## Pages

`/` home · `/movies` all movies (search, genre, decade, sort, pages) · `/movies/:id` movie detail ·
`/dictionary` · `/reviews` · `/songs` · `/updates` · `/books` · `/play` · `/creator`

## Where things are

- `server/data/*.json`: seed data. On first start it is copied into `server/data/movictionary.sqlite`.
- Movies, reviews, terms, songs, updates, poll options and subscribers are edited in the admin panel.
- `server/openapi.js`: the Swagger/OpenAPI spec.
- `client/src`: React app (`App.jsx`, `pages/`, `components/`).
