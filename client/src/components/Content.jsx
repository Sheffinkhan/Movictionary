import { useApi } from '../lib.js';

export function Songs() {
  const [songs] = useApi('/api/songs', []);
  return (
    <section id="songs">
      <div className="sec-head"><div><h2>Songs from the screen</h2><p>Soundtrack picks and movie songs on repeat. Each one opens a YouTube search.</p></div></div>
      <div className="tracks">
        {songs.map((s, i) => (
          <a className="track" key={s.title} target="_blank" rel="noopener" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${s.title} ${s.movie}`)}`}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <div><b>{s.title}</b><span>{s.artist} · {s.movie}</span></div>
            <span className="play">Listen ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function Updates() {
  const [updates] = useApi('/api/updates', []);
  return (
    <section id="updates">
      <div className="sec-head"><div><h2>Updates</h2><p>Releases, trailers and streaming drops in quick cards.</p></div></div>
      <div className="grid">
        {updates.map((u) => (
          <article className="card upd" key={u.h}>
            <div className="date"><b>{u.d}</b><span>{u.m}</span></div>
            <div><span className="tag">{u.tag}</span><h3>{u.h}</h3><p>{u.p}</p></div>
          </article>
        ))}
      </div>
      <p className="note">Sample updates. Edit them in server/data/content.json.</p>
    </section>
  );
}

export function Books({ instagram }) {
  const [data] = useApi('/api/books', { books: [], story: null });
  return (
    <section id="books">
      <div className="sec-head"><div><h2>Books &amp; Stories</h2><p>Page versus screen, plus short stories from the community.</p></div></div>
      <div className="grid">
        {data.books.map((b) => (
          <article className="card" key={b.b}>
            <span className="tag">Book vs Film</span>
            <div className="vs">
              <div>{b.b}<small>{b.a}</small></div><i>VS</i><div>{b.f}<small>On screen</small></div>
            </div>
            <p>{b.v}</p>
          </article>
        ))}
        {data.story && (
          <article className="card" style={{ borderColor: 'var(--gold)' }}>
            <span className="tag">Stories</span>
            <h3>{data.story.t}</h3>
            <p>{data.story.x}</p>
            <a className="btn" style={{ alignSelf: 'flex-start', marginTop: 'auto' }} target="_blank" rel="noopener" href={instagram}>Send via Instagram DM</a>
          </article>
        )}
      </div>
    </section>
  );
}
