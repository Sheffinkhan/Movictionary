const ok = (description, schema) => ({
  description,
  content: { 'application/json': { schema } },
});
const arr = (ref) => ({ type: 'array', items: { $ref: `#/components/schemas/${ref}` } });
const body = (schema) => ({ required: true, content: { 'application/json': { schema } } });
const bad = { 400: { description: 'Invalid input' } };

export default {
  openapi: '3.0.3',
  info: {
    title: 'Movictionary API',
    version: '1.0.0',
    description: 'Movie dictionary, reviews, songs, updates, books, quiz, poll and creator tools.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Movies' }, { name: 'Stories' }, { name: 'Dictionary' }, { name: 'Content' }, { name: 'Play' }, { name: 'Creator' }, { name: 'Newsletter' },
  ],
  paths: {
    '/api/health': { get: { summary: 'Health check', responses: { 200: ok('Server is running', { type: 'object', properties: { ok: { type: 'boolean' } } }) } } },
    '/api/movies': {
      get: {
        tags: ['Movies'], summary: 'Browse all Malayalam movies (search, filter, sort, paginate)',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Movie title or director' },
          { name: 'genre', in: 'query', schema: { type: 'string' } },
          { name: 'decade', in: 'query', schema: { type: 'integer', example: 2010 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'title'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 24, maximum: 100 } },
        ],
        responses: { 200: ok('Page of movies with total, genres and decades', { type: 'object' }) },
      },
    },
    '/api/movies/{id}': {
      get: {
        tags: ['Movies'], summary: 'Movie details with review and related films',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'premam-2015' } }],
        responses: { 200: ok('Movie', { type: 'object' }), 404: { description: 'Movie not found' } },
      },
    },
    '/api/posts': {
      get: {
        tags: ['Stories'], summary: 'Published story posts (writing, image, video), newest first',
        parameters: [{ name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'text', 'image', 'video'] } }],
        responses: { 200: ok('Posts', { type: 'array', items: { type: 'object' } }) },
      },
    },
    '/api/terms': {
      get: {
        tags: ['Dictionary'], summary: 'List dictionary terms (A–Z)',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search term or definition text' },
          { name: 'letter', in: 'query', schema: { type: 'string', maxLength: 1 }, description: 'First letter filter' },
        ],
        responses: { 200: ok('Matching terms', arr('Term')) },
      },
    },
    '/api/terms/today': { get: { tags: ['Dictionary'], summary: 'Word of the day', responses: { 200: ok('Today’s term', { $ref: '#/components/schemas/Term' }) } } },
    '/api/reviews': {
      get: {
        tags: ['Content'], summary: 'List reviews',
        parameters: [{ name: 'genre', in: 'query', schema: { type: 'string' }, description: 'e.g. Sci-Fi, Comedy, or All' }],
        responses: { 200: ok('Reviews', arr('Review')) },
      },
    },
    '/api/songs': { get: { tags: ['Content'], summary: 'Soundtrack picks', responses: { 200: ok('Songs', arr('Song')) } } },
    '/api/updates': { get: { tags: ['Content'], summary: 'Release and news updates', responses: { 200: ok('Updates', arr('Update')) } } },
    '/api/books': { get: { tags: ['Content'], summary: 'Book vs film comparisons and story callout', responses: { 200: ok('Books', { type: 'object' }) } } },
    '/api/tips': { get: { tags: ['Creator'], summary: 'Content creation tips', responses: { 200: ok('Tips', { type: 'array', items: { type: 'array', items: { type: 'string' } } }) } } },
    '/api/moods': { get: { tags: ['Play'], summary: 'Mood to movie recommendations', responses: { 200: ok('Mood map', { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } }) } } },
    '/api/quiz': {
      get: {
        tags: ['Play'], summary: 'Get an emoji clue (daily by default)',
        parameters: [{ name: 'id', in: 'query', schema: { type: 'integer' }, description: 'Specific clue id' }],
        responses: { 200: ok('Clue', { type: 'object', properties: { id: { type: 'integer' }, emoji: { type: 'string' }, hint: { type: 'string' } } }) },
      },
    },
    '/api/quiz/check': {
      post: {
        tags: ['Play'], summary: 'Check a guess',
        requestBody: body({ type: 'object', required: ['id', 'guess'], properties: { id: { type: 'integer' }, guess: { type: 'string' } } }),
        responses: { 200: ok('Result', { type: 'object', properties: { correct: { type: 'boolean' }, answer: { type: 'string' } } }), ...bad },
      },
    },
    '/api/poll': { get: { tags: ['Play'], summary: 'Poll results', responses: { 200: ok('Options with votes', arr('PollOption')) } } },
    '/api/poll/vote': {
      post: {
        tags: ['Play'], summary: 'Vote in the poll',
        requestBody: body({ type: 'object', required: ['option'], properties: { option: { type: 'integer', example: 0 } } }),
        responses: { 200: ok('Updated results', arr('PollOption')), ...bad },
      },
    },
    '/api/generate': {
      post: {
        tags: ['Creator'], summary: 'Generate captions and hashtags for a movie',
        requestBody: body({ type: 'object', required: ['movie'], properties: { movie: { type: 'string', example: 'Interstellar' } } }),
        responses: { 200: ok('Captions and hashtags', { type: 'object', properties: { captions: { type: 'array', items: { type: 'string' } }, hashtags: { type: 'string' } } }), ...bad },
      },
    },
    '/api/subscribe': {
      post: {
        tags: ['Newsletter'], summary: 'Join the Reel Digest',
        requestBody: body({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }),
        responses: { 200: ok('Subscribed', { type: 'object', properties: { ok: { type: 'boolean' } } }), ...bad },
      },
    },
  },
  components: {
    schemas: {
      Term: { type: 'object', properties: { t: { type: 'string', example: 'Cameo' }, p: { type: 'string', example: 'noun' }, d: { type: 'string' }, e: { type: 'string' } } },
      Review: { type: 'object', properties: { t: { type: 'string' }, g: { type: 'string' }, y: { type: 'integer' }, s: { type: 'integer' }, x: { type: 'string' } } },
      Song: { type: 'object', properties: { title: { type: 'string' }, artist: { type: 'string' }, movie: { type: 'string' } } },
      Update: { type: 'object', properties: { d: { type: 'string' }, m: { type: 'string' }, h: { type: 'string' }, p: { type: 'string' }, tag: { type: 'string' } } },
      PollOption: { type: 'object', properties: { label: { type: 'string' }, votes: { type: 'integer' } } },
    },
  },
};
