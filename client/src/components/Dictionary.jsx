import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Dictionary() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [letter, setLetter] = useState('');
  const [terms, setTerms] = useState([]);
  const [present, setPresent] = useState(null);


  useEffect(() => {
    api('/api/terms').then((all) => setPresent(new Set(all.map((t) => t.t[0].toUpperCase()))));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ q, letter });
    const id = setTimeout(() => api(`/api/terms?${params}`).then(setTerms), 150);
    return () => clearTimeout(id);
  }, [q, letter]);

  const letters = present ? LETTERS.filter((l) => present.has(l)) : [];

  return (
    <section id="dictionary">
      <div className="sec-head">
        <div><h2>The Movie Dictionary</h2><p>Film terms in plain language, from the set to the screen. Search or jump to a letter.</p></div>
        <div className="search" style={{ maxWidth: 320, width: '100%' }}>
          <label className="sr" htmlFor="dq">Filter terms</label>
          <input id="dq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter terms…" autoComplete="off" />
        </div>
      </div>
      <div className="az" aria-label="Filter by letter">
        {['', ...letters].map((l) => (
          <button key={l || 'all'} aria-pressed={letter === l} onClick={() => setLetter(l)} style={l ? null : { width: 'auto', padding: '0 10px' }}>{l || 'All'}</button>
        ))}
      </div>
      <div className="grid">
        {terms.length ? terms.map((t) => (
          <article className="card dict-card" key={t.t}>
            <div className="term">{t.t}</div>
            <div className="pos" style={{ margin: 0 }}>{t.p}</div>
            <div className="def">{t.d}</div>
            <div className="ex">{t.e}</div>
          </article>
        )) : <div className="empty">No terms match “{q}”. Try another word, or send it to us as a request on Instagram.</div>}
      </div>
    </section>
  );
}
