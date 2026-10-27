import { Link, useParams } from 'react-router-dom';
import { useApi, useApp } from '../lib.js';
import MovieCard from '../components/MovieCard.jsx';

export default function MovieDetail() {
  const { id } = useParams();
  const [m, error] = useApi(`/api/movies/${id}`, null);
  const { watchlist, toggleWatch } = useApp();

  if (error) {
    return <section style={{ borderTop: 0 }}><h2>Movie not found</h2><p><Link to="/movies">Back to all movies</Link></p></section>;
  }
  if (!m) return <section style={{ borderTop: 0 }} className="empty">Loading…</section>;

  const on = watchlist.includes(m.title);
  const yt = (extra) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${m.title} ${m.year} malayalam ${extra}`)}`;
  const full = m.review ? Math.round(m.review.score / 2) : 0;

  return (
    <section className="detail" style={{ borderTop: 0 }}>
      <Link to="/movies" className="back">← All movies</Link>
      <span className="eyebrow" style={{ display: 'block', marginTop: 18 }}>{m.genre} · Malayalam</span>
      <h1 className="detail-title">{m.title}</h1>
      <dl className="facts">
        <div><dt>Year</dt><dd>{m.year}</dd></div>
        <div><dt>Director</dt><dd>{m.director}</dd></div>
        <div><dt>Genre</dt><dd>{m.genre}</dd></div>
        <div><dt>Language</dt><dd>Malayalam</dd></div>
      </dl>
      <div className="cta-row">
        <button className={`btn ${on ? '' : 'ghost'}`} onClick={() => toggleWatch(m.title)}>{on ? 'Saved ✓' : 'Add to watchlist'}</button>
        <a className="btn ghost" href={yt('trailer')} target="_blank" rel="noopener">Watch trailer ↗</a>
        <a className="btn ghost" href={yt('songs')} target="_blank" rel="noopener">Listen to songs ↗</a>
      </div>

      <div className="card" style={{ marginTop: 28, maxWidth: 720 }}>
        <span className="tag">Movictionary review</span>
        {m.review ? (
          <>
            <div className="top" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div className="stars" aria-label={`${full} of 5 stars`}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</div>
              <span className="score" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{m.review.score}<span style={{ fontSize: 13, color: 'var(--muted)' }}>/10</span></span>
            </div>
            <p style={{ color: 'var(--fg)', fontFamily: 'var(--font-serif)', fontSize: 19 }}>{m.review.text}</p>
          </>
        ) : <p>No review yet. Follow @movictionary_ on Instagram to see when this one is covered.</p>}
      </div>

      {m.related.length > 0 && (
        <>
          <h2 style={{ fontSize: 24, margin: '44px 0 18px' }}>More {m.genre} films</h2>
          <div className="grid">{m.related.map((r) => <MovieCard key={r.id} movie={r} />)}</div>
        </>
      )}
    </section>
  );
}
