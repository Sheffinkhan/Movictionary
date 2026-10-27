import { useState } from 'react';
import { api, copyText, useApi, useApp } from '../lib.js';

export default function Creator() {
  const { toast } = useApp();
  const [movie, setMovie] = useState('');
  const [out, setOut] = useState(null);
  const [tips] = useApi('/api/tips', []);

  const submit = async (e) => {
    e.preventDefault();
    if (!movie.trim()) return;
    try { setOut(await api('/api/generate', { movie })); } catch (err) { toast(err.message); }
  };

  return (
    <section id="creator">
      <div className="sec-head"><div><h2>Creator Corner</h2><p>Type a movie name and get caption ideas and hashtags ready to paste into your next post.</p></div></div>
      <div className="card">
        <form className="row" onSubmit={submit}>
          <label className="sr" htmlFor="genIn">Movie name</label>
          <input id="genIn" value={movie} onChange={(e) => setMovie(e.target.value)} placeholder="e.g. Interstellar" autoComplete="off" />
          <button className="btn" type="submit">Generate</button>
        </form>
        {out && (
          <div className="gen-out">
            {out.captions.map((c) => (
              <div className="card" key={c}><p style={{ color: 'var(--fg)' }}>{c}</p><button className="copy" onClick={() => copyText(c, toast)}>Copy caption</button></div>
            ))}
            <div className="card"><div className="hash">{out.hashtags}</div><button className="copy" onClick={() => copyText(out.hashtags, toast)}>Copy hashtags</button></div>
          </div>
        )}
      </div>
      <div className="grid" style={{ marginTop: 16 }}>
        {tips.map(([title, text]) => (
          <article className="card" key={title}><span className="tag">Tip</span><h3>{title}</h3><p>{text}</p></article>
        ))}
      </div>
    </section>
  );
}
