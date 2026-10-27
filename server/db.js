import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Sequelize, DataTypes } from 'sequelize';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS = path.join(__dirname, 'uploads');
const read = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', f), 'utf8'));

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'data', 'movictionary.sqlite'),
  logging: false,
});

const { STRING, INTEGER, TEXT } = DataTypes;

export const Movie = sequelize.define('Movie', {
  id: { type: STRING, primaryKey: true },
  title: { type: STRING, allowNull: false },
  year: { type: INTEGER, allowNull: false },
  director: STRING,
  genre: STRING,
}, { timestamps: false });

export const Term = sequelize.define('Term', {
  term: { type: STRING, allowNull: false },
  pos: STRING,
  definition: { type: TEXT, allowNull: false },
  example: TEXT,
}, { timestamps: false });

export const Review = sequelize.define('Review', {
  title: { type: STRING, allowNull: false },
  genre: STRING,
  year: INTEGER,
  score: { type: INTEGER, validate: { min: 1, max: 10 } },
  text: TEXT,
}, { timestamps: false });

export const Song = sequelize.define('Song', {
  title: { type: STRING, allowNull: false },
  artist: STRING,
  movie: STRING,
}, { timestamps: false });

export const Update = sequelize.define('Update', {
  day: STRING,
  month: STRING,
  headline: { type: STRING, allowNull: false },
  text: TEXT,
  tag: STRING,
}, { timestamps: false });

export const PollOption = sequelize.define('PollOption', {
  label: { type: STRING, allowNull: false },
  votes: { type: INTEGER, defaultValue: 0 },
}, { timestamps: false });

export const Post = sequelize.define('Post', {
  title: { type: STRING, allowNull: false },
  body: TEXT,
  videoUrl: STRING,
  imageKey: STRING,
  imageBucket: STRING,
  imageMime: STRING,
  videoKey: STRING,
  videoBucket: STRING,
  videoMime: STRING,
  published: { type: DataTypes.BOOLEAN, defaultValue: true },
});

export const Subscriber = sequelize.define('Subscriber', {
  email: { type: STRING, allowNull: false, unique: true },
}, { updatedAt: false });

// Creates tables and fills empty ones from the JSON seed files.
export async function initDb() {
  await sequelize.sync();
  const content = read('content.json');
  const seed = [
    [Movie, read('movies.json')],
    [Term, content.TERMS.map((t) => ({ term: t.t, pos: t.p, definition: t.d, example: t.e }))],
    [Review, content.REVIEWS.map((r) => ({ title: r.t, genre: r.g, year: r.y, score: r.s, text: r.x }))],
    [Song, content.SONGS],
    [Update, content.UPDATES.map((u) => ({ day: u.d, month: u.m, headline: u.h, text: u.p, tag: u.tag }))],
    [PollOption, content.POLL],
  ];
  for (const [Model, rows] of seed) {
    if ((await Model.count()) === 0) await Model.bulkCreate(rows);
  }
  if ((await Post.count()) === 0) {
    const dir = path.join(UPLOADS, 'posts', 'welcome');
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(__dirname, 'seed', 'welcome.svg'), path.join(dir, 'welcome.svg'));
    await Post.bulkCreate([
      {
        title: 'Welcome to Movictionary Stories',
        body: 'This is where I share my stories, photos and videos about Malayalam cinema. Writing, pictures and clips will all show up here, newest first.',
        imageKey: 'posts/welcome/welcome.svg', imageBucket: UPLOADS, imageMime: 'image/svg+xml',
      },
      {
        title: 'Why Malayalam films feel so close to home',
        body: 'The kitchen, the tea shop, the bus stop. Malayalam cinema finds big stories in small places, and that is why a film about four brothers in a fishing village can make a whole country feel seen.\n\nWhat was the first Malayalam film that felt like your own life? Tell me on Instagram.',
      },
    ]);
  }
  return content;
}
