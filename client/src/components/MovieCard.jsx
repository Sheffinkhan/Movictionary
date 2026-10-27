import { Link } from 'react-router-dom';
import { useApp } from '../lib.js';

export default function MovieCard({ movie }) {
  const { watchlist, toggleWatch } = useApp();
  const on = watchlist.includes(movie.title);
  return (
    <article className="card movie">
      <span className="tag">{movie.genre} · {movie.year}</span>
      <h3><Link to={`/movies/${movie.id}`}>{movie.title}</Link></h3>
      <p>Directed by {movie.director}</p>
      <div className="foot">
        {movie.reviewed ? <span className="badge">Reviewed</span> : <span />}
        <button className={`add ${on ? 'on' : ''}`} onClick={() => toggleWatch(movie.title)}>{on ? 'Saved ✓' : 'Add to watchlist'}</button>
      </div>
    </article>
  );
}
