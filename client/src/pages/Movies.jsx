import { useSearchParams } from 'react-router-dom';
import { useApi } from '../lib.js';
import MovieCard from '../components/MovieCard.jsx';

export default function Movies() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const genre = params.get('genre') || 'All';
  const decade = params.get('decade') || 'All';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;

  const query = new URLSearchParams({ q, genre, decade, sort, page, limit: 24 });
  const [data] = useApi(`/api/movies?${query}`, { items: [], total: 0, pages: 1, genres: [], decades: [] });

  // Changing any filter returns to page 1; the URL holds the state so pages can be shared.
  const set = (key, value, keepPage = false) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All' && !(key === 'sort' && value === 'newest') && !(key === 'page' && value === 1)) next.set(key, value);
    else next.delete(key);
    if (!keepPage) next.delete('page');
    setParams(next, { replace: true });
  };

  return (
    <section id="movies">
      <div className="sec-head">
        <div><h2>All Malayalam Movies</h2><p>{data.total} films from Mollywood, from the classics to the latest. Search, filter and open any film.</p></div>
      </div>

      <div className="filters">
        <label className="sr" htmlFor="mq">Search movies or directors</label>
        <input id="mq" className="field" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search a movie or director…" autoComplete="off" />
        <label className="sr" htmlFor="mg">Genre</label>
        <select id="mg" className="field" value={genre} onChange={(e) => set('genre', e.target.value)}>
          <option value="All">All genres</option>
          {data.genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        <label className="sr" htmlFor="md">Decade</label>
        <select id="md" className="field" value={decade} onChange={(e) => set('decade', e.target.value)}>
          <option value="All">All decades</option>
          {data.decades.map((d) => <option key={d} value={d}>{d}s</option>)}
        </select>
        <label className="sr" htmlFor="ms">Sort</label>
        <select id="ms" className="field" value={sort} onChange={(e) => set('sort', e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">A to Z</option>
        </select>
      </div>

      <div className="grid posters">
        {data.items.length
          ? data.items.map((m) => <MovieCard key={m.id} movie={m} />)
          : <div className="empty">No movies match your filters. Try clearing the search.</div>}
      </div>

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page <= 1} onClick={() => set('page', page - 1, true)}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn ghost" disabled={page >= data.pages} onClick={() => set('page', page + 1, true)}>Next</button>
        </div>
      )}
    </section>
  );
}
