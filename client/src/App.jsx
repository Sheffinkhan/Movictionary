import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AppContext, INSTAGRAM, storage } from './lib.js';
import Home from './pages/Home.jsx';
import Movies from './pages/Movies.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import Dictionary from './components/Dictionary.jsx';
import Reviews from './components/Reviews.jsx';
import { Songs, Updates, Books } from './components/Content.jsx';
import PlayZone from './components/PlayZone.jsx';
import Creator from './components/Creator.jsx';
import Stories from './pages/Stories.jsx';
import Newsletter from './components/Newsletter.jsx';

const LINKS = [['/movies', 'Movies'], ['/dictionary', 'Dictionary'], ['/reviews', 'Reviews'], ['/songs', 'Songs'], ['/updates', 'Updates'], ['/books', 'Books'], ['/stories', 'Stories'], ['/play', 'Play'], ['/creator', 'Creator']];


function NotFound() {
  return (
    <section style={{ textAlign: 'center', borderTop: 0 }}>
      <h2 style={{ fontSize: 40 }}>Scene not found</h2>
      <p style={{ color: 'var(--muted)' }}>That page doesn’t exist.</p>
      <Link className="btn" to="/">Back to home</Link>
    </section>
  );
}

export default function App() {
  const [watchlist, setWatchlist] = useState(() => storage.get('mov-wl', []));
  const [panel, setPanel] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toastText, setToastText] = useState('');
  const timer = useRef();
  const { pathname } = useLocation();

  useEffect(() => { storage.set('mov-wl', watchlist); }, [watchlist]);
  useEffect(() => { window.scrollTo(0, 0); setPanel(false); setMenu(false); }, [pathname]);
  useEffect(() => { document.body.classList.toggle('lock', menu || panel); }, [menu, panel]);
  useEffect(() => {
    const saved = storage.get('mov-theme', null);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const onKey = (e) => { if (e.key === 'Escape') { setPanel(false); setMenu(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const toast = useCallback((t) => {
    setToastText(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastText(''), 1800);
  }, []);

  const toggleWatch = useCallback((title) => {
    setWatchlist((list) => {
      const has = list.includes(title);
      toast(has ? 'Removed' : 'Added to watchlist');
      return has ? list.filter((t) => t !== title) : [...list, title];
    });
  }, [toast]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    storage.set('mov-theme', next);
  };

  return (
    <AppContext.Provider value={{ watchlist, toggleWatch, toast }}>
      <nav>
        <div className="nav-in">
          <Link className="logo" to="/" aria-label="Movictionary home">mo<i /></Link>
          <div className="links">
            {LINKS.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
            <a href="/api/docs" target="_blank" rel="noopener">API</a>
          </div>
          <button className="icon-btn" onClick={() => setPanel(true)} aria-label="Open watchlist"><span className="lbl">Watchlist</span><span className="ico" aria-hidden="true">♥</span><span className="wl-count">{watchlist.length}</span></button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Switch light or dark theme"><span className="lbl">Theme</span><span className="ico" aria-hidden="true">◐</span></button>
        </div>
      </nav>

      <div className={`sheet ${menu ? 'open' : ''}`} onClick={() => setMenu(false)} aria-hidden={!menu}>
        <div className="sheet-in" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-head"><b>Explore</b><button className="icon-btn" onClick={() => setMenu(false)}>Close</button></div>
          <div className="sheet-grid">
            <NavLink to="/" end>Home</NavLink>
            {LINKS.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
            <a href="/api/docs" target="_blank" rel="noopener">API</a>
          </div>
        </div>
      </div>

      <div className="tabbar" role="navigation" aria-label="Quick links">
        <NavLink to="/" end><i>⌂</i>Home</NavLink>
        <NavLink to="/movies"><i>▶</i>Movies</NavLink>
        <NavLink to="/dictionary"><i>Aa</i>Words</NavLink>
        <NavLink to="/stories"><i>✎</i>Stories</NavLink>
        <button className={menu ? 'active' : ''} onClick={() => setMenu(true)}><i>☰</i>More</button>
      </div>

      <aside className={`panel ${panel ? 'open' : ''}`} aria-label="Your watchlist">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>My watchlist</h3>
          <button className="icon-btn" onClick={() => setPanel(false)}>Close</button>
        </div>
        {watchlist.length ? watchlist.map((t) => (
          <div className="wl-item" key={t}><span>{t}</span><button onClick={() => toggleWatch(t)}>Remove</button></div>
        )) : <p style={{ color: 'var(--muted)' }}>Nothing saved yet. Add movies from the Movies page.</p>}
      </aside>

      <main className="wrap page" id="top">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/books" element={<Books instagram={INSTAGRAM} />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/play" element={<PlayZone />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Newsletter />
        <footer>
          <div><b style={{ color: 'var(--fg)' }}>Movictionary</b> · Malayalam cinema dictionary, songs, updates and reviews.</div>
          <span><a href="/api/docs" target="_blank" rel="noopener">API docs</a> · <a href={INSTAGRAM} target="_blank" rel="noopener">Instagram @movictionary_</a></span>
        </footer>
      </main>
      <div className={`toast ${toastText ? 'show' : ''}`} role="status">{toastText}</div>
    </AppContext.Provider>
  );
}
