import { useCallback, useEffect, useRef, useState } from 'react';
import { storage, useApi } from './lib.js';
import Dictionary from './components/Dictionary.jsx';
import Reviews from './components/Reviews.jsx';
import { Songs, Updates, Books } from './components/Content.jsx';
import PlayZone from './components/PlayZone.jsx';
import Creator from './components/Creator.jsx';
import Newsletter from './components/Newsletter.jsx';

const LINKS = ['Dictionary', 'Reviews', 'Songs', 'Updates', 'Books', 'Play', 'Creator'];
const INSTAGRAM = 'https://www.instagram.com/movictionary_/';

export default function App() {
  const [watchlist, setWatchlist] = useState(() => storage.get('mov-wl', []));
  const [panel, setPanel] = useState(false);
  const [toastText, setToastText] = useState('');
  const timer = useRef();
  const [today] = useApi('/api/terms/today', null);
  const [allTerms] = useApi('/api/terms', []);
  const [heroQuery, setHeroQuery] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { storage.set('mov-wl', watchlist); }, [watchlist]);
  useEffect(() => {
    const saved = storage.get('mov-theme', null);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const onKey = (e) => e.key === 'Escape' && setPanel(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const toast = useCallback((t) => {
    setToastText(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastText(''), 1800);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    storage.set('mov-theme', next);
  };

  const toggleWatch = (title) => {
    const has = watchlist.includes(title);
    setWatchlist(has ? watchlist.filter((t) => t !== title) : [...watchlist, title]);
    toast(has ? 'Removed' : 'Added to watchlist');
  };

  const onHeroSearch = (e) => {
    e.preventDefault();
    setSearch(heroQuery);
    document.getElementById('dictionary').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav>
        <div className="nav-in">
          <a className="logo" href="#top" aria-label="Movictionary home">mo<i /></a>
          <div className="links">
            {LINKS.map((l) => <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>)}
            <a href="/api/docs" target="_blank" rel="noopener">API</a>
          </div>
          <button className="icon-btn" onClick={() => setPanel(true)}>Watchlist<span className="wl-count">{watchlist.length}</span></button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Switch light or dark theme">Theme</button>
        </div>
      </nav>

      <aside className={`panel ${panel ? 'open' : ''}`} aria-label="Your watchlist">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>My watchlist</h3>
          <button className="icon-btn" onClick={() => setPanel(false)}>Close</button>
        </div>
        {watchlist.length ? watchlist.map((t) => (
          <div className="wl-item" key={t}><span>{t}</span><button onClick={() => toggleWatch(t)}>Remove</button></div>
        )) : <p style={{ color: 'var(--muted)' }}>Nothing saved yet. Add movies from the reviews.</p>}
      </aside>

      <main className="wrap" id="top">
        <header className="hero">
          <div>
            <div className="eyebrow">Malayalam cinema · Dictionary · Songs · Reviews</div>
            <h1>Every <em>Mollywood</em> word, explained.</h1>
            <p className="lead">Movictionary is the pocket dictionary for Malayalam film lovers. Look up a term, find a review, catch the latest releases and test yourself with a daily guess.</p>
            <form className="search" onSubmit={onHeroSearch} role="search">
              <label className="sr" htmlFor="heroQ">Search the dictionary</label>
              <input id="heroQ" value={heroQuery} onChange={(e) => setHeroQuery(e.target.value)} placeholder="Try “cameo”, “montage” or “plot twist”" autoComplete="off" />
              <button className="btn" type="submit">Look up</button>
            </form>
            <div className="cta-row">
              <a className="btn ghost" href={INSTAGRAM} target="_blank" rel="noopener">Follow @movictionary_</a>
              <a className="btn ghost" href="#play">Play today’s quiz</a>
            </div>
            <div className="stats"><div><b>5,112</b><span>followers on Instagram</span></div><div><b>{allTerms.length || ''}</b><span>terms in the dictionary</span></div></div>
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

        <Dictionary externalQuery={search} />
        <Reviews watchlist={watchlist} onToggle={toggleWatch} />
        <Songs />
        <Updates />
        <Books instagram={INSTAGRAM} />
        <PlayZone />
        <Creator toast={toast} />
        <Newsletter toast={toast} />

        <footer>
          <div><b style={{ color: 'var(--fg)' }}>Movictionary</b> · Movie dictionary, songs, updates and reviews.</div>
          <span><a href="/api/docs" target="_blank" rel="noopener">API docs</a> · <a href={INSTAGRAM} target="_blank" rel="noopener">Instagram @movictionary_</a></span>
        </footer>
      </main>
      <div className={`toast ${toastText ? 'show' : ''}`} role="status">{toastText}</div>
    </>
  );
}
