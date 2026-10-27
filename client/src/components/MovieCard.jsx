import { Link } from 'react-router-dom';
import { useApp } from '../lib.js';

export const slug = (g) => String(g).toLowerCase().replace(/[^a-z]+/g, '-');

// Poster-style tile: each genre gets its own color through the g-<genre> class.
export default function MovieCard({ movie }) {
  const { watchlist, toggleWatch } = useApp();
  const on = watchlist.includes(movie.title);
  return (
    <article className={`poster g-${slug(movie.genre)}`}>
      <Link className="poster-link" to={`/movies/${movie.id}`}>
        <span className="p-year" aria-hidden="true">{movie.year}</span>
        <span className="p-genre">{movie.genre}</span>
        <h3>{movie.title}</h3>
        <span className="p-dir">{movie.director}</span>
      </Link>
      <div className="p-foot">
        {movie.reviewed ? <span className="p-badge">Reviewed</span> : <span />}
        <button className={`p-add ${on ? 'on' : ''}`} onClick={() => toggleWatch(movie.title)} aria-label={on ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}>{on ? 'Saved ✓' : '+ Watchlist'}</button>
      </div>
    </article>
  );
}
