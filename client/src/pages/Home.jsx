import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { INSTAGRAM, useApi } from '../lib.js';
import MovieCard from '../components/MovieCard.jsx';


const EXPLORE = [
  ['/movies', 'Movies', 'Browse every Malayalam film in the catalogue.'],
  ['/dictionary', 'Dictionary', 'Film terms and Mollywood slang, explained.'],
  ['/reviews', 'Reviews', 'Short, spoiler-free takes with scores.'],
  ['/songs', 'Songs', 'Soundtrack picks that stay on repeat.'],
  ['/updates', 'Updates', 'Releases, OTT drops and festival news.'],
  ['/books', 'Books & Stories', 'Page versus screen, and your stories.'],
  ['/play', 'Play Zone', 'Daily quiz, poll and mood picker.'],
  ['/creator', 'Creator Corner', 'Captions, hashtags and posting tips.'],
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [today] = useApi('/api/terms/today', null);
  const [latest] = useApi('/api/movies?limit=6', { items: [], total: 0 });

  const search = (e) => {
    e.preventDefault();
    navigate(`/movies?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="hero">
        <div>
          <div className="eyebrow">Malayalam cinema · Dictionary · Songs · Reviews</div>
          <h1>Every <em>Mollywood</em> word, explained.</h1>
          <p className="lead">Movictionary is the pocket dictionary for Malayalam film lovers. Browse every movie, look up a term, read a review and test yourself with a daily guess.</p>
          <form className="search" onSubmit={search} role="search">
            <label className="sr" htmlFor="heroQ">Search movies</label>
            <input id="heroQ" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a Malayalam movie or director" autoComplete="off" />
            <button className="btn" type="submit">Search</button>
          </form>
          <div className="cta-row">
            <Link className="btn ghost" to="/movies">Browse all movies</Link>
            <a className="btn ghost" href={INSTAGRAM} target="_blank" rel="noopener">Follow @movictionary_</a>
          </div>
          <div className="stats"><div><b>5,112</b><span>followers on Instagram</span></div><div><b>{latest.total || ''}</b><span>Malayalam movies listed</span></div></div>
        </div>
        <article className="wotd" aria-live="polite">
          <div className="eyebrow">Word of the day</div>
          {today && <>
            <div className="term">{today.t}</div>
            <div className="pos">{today.p}</div>
            <p>{today.d}</p>
            <div className="ex">“{today.e}”</div>
          </>}
        </article>
      </header>

      <section>
        <div className="sec-head">
          <div><h2>Latest Malayalam films</h2><p>The newest releases in the catalogue.</p></div>
          <Link className="btn ghost" to="/movies">See all {latest.total || ''} movies</Link>
        </div>
        <div className="grid">{latest.items.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
      </section>

      <section>
        <div className="sec-head"><div><h2>Explore Movictionary</h2></div></div>
        <div className="grid">
          {EXPLORE.map(([to, title, text]) => (
            <Link key={to} to={to} className="card tile">
              <h3>{title}</h3><p>{text}</p><span className="tag">Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
