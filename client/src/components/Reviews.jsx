import { useState } from 'react';
import { useApi } from '../lib.js';

export default function Reviews({ watchlist, onToggle }) {
  const [genre, setGenre] = useState('All');
  const [all] = useApi('/api/reviews', []);
  const GENRES = ['All', ...new Set(all.map((r) => r.g))];
  const reviews = genre === 'All' ? all : all.filter((r) => r.g === genre);

  return (
    <section id="reviews">
      <div className="sec-head">
        <div><h2>Reviews</h2><p>Short, spoiler-free takes with a score out of 10. Tap “Add to watchlist” to save a pick.</p></div>
        <div className="chips">
          {GENRES.map((g) => <button key={g} className="chip" aria-pressed={g === genre} onClick={() => setGenre(g)}>{g}</button>)}
        </div>
      </div>
      <div className="grid">
        {reviews.map((r) => {
          const on = watchlist.includes(r.t);
          const full = Math.round(r.s / 2);
          return (
            <article className="card rev" key={r.t}>
              <div className="top">
                <div><span className="tag">{r.g} · {r.y}</span><h3 style={{ marginTop: 4 }}>{r.t}</h3></div>
                <div className="stars" aria-label={`${full} of 5 stars`}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</div>
              </div>
              <p>{r.x}</p>
              <div className="foot">
                <span className="score">{r.s}<span style={{ fontSize: 13, color: 'var(--muted)' }}>/10</span></span>
                <button className={`add ${on ? 'on' : ''}`} onClick={() => onToggle(r.t)}>{on ? 'Saved ✓' : 'Add to watchlist'}</button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="note">Sample reviews. Edit them in server/data/content.json.</p>
    </section>
  );
}
