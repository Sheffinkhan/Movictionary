# Movictionary

Movie dictionary, reviews, songs, updates, books, quiz, poll and creator tools.
React (Vite) frontend + Node.js (Express) API with Swagger docs.

## Run it

```bash
npm run install:all
npm run dev:server    # API on http://localhost:3001
npm run dev:client    # site on http://localhost:5173 (proxies /api to the API)
```

Swagger UI: http://localhost:3001/api/docs (raw spec at `/api/openapi.json`)

## Production

```bash
npm run build         # builds client/dist
npm start             # Express serves the site and the API on :3001
```

## Where things are

- `server/data/content.json`: terms, reviews, songs, updates, books, quiz clues. Edit this to change content.
- `server/data/store.json`: poll votes and newsletter emails (created on first use, not committed).
- `server/openapi.js`: the Swagger/OpenAPI spec.
- `client/src`: React app (`App.jsx` and `components/`).
