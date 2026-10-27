import { useEffect, useState } from 'react';
import { api, storage, useApi } from '../lib.js';

function Quiz() {
  const [clue, setClue] = useState(null);
  const [guess, setGuess] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [streak, setStreak] = useState(() => storage.get('mov-streak', 0));

  const load = (id) => {
    api(id === undefined ? '/api/quiz' : `/api/quiz?id=${id}`).then((c) => { setClue(c); setGuess(''); setMsg({ text: '', ok: false }); });
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!guess.trim() || !clue) return;
    const r = await api('/api/quiz/check', { id: clue.id, guess });
    const next = r.correct ? streak + 1 : 0;
    setStreak(next);
    storage.set('mov-streak', next);
    setMsg(r.correct
      ? { text: `Correct! 🎬 ${r.answer.replace(/\b\w/g, (c) => c.toUpperCase())}`, ok: true }
      : { text: 'Not quite. Try again or use another clue.', ok: false });
  };

  return (
    <div className="card quiz">
      <span className="tag">Guess the movie · daily</span>
      <div className="emoji" aria-label="Emoji clue">{clue?.emoji}</div>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>{clue?.hint}</div>
      <form className="row" onSubmit={submit}>
        <label className="sr" htmlFor="qIn">Your guess</label>
        <input id="qIn" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Type the movie name" autoComplete="off" />
        <button className="btn" type="submit">Guess</button>
      </form>
      <div className={`msg ${msg.text ? (msg.ok ? 'ok' : 'no') : ''}`}>{msg.text}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>
        Streak: <b>{streak}</b> · <button className="copy" style={{ margin: 0 }} onClick={() => load(((clue?.id ?? 0) + 1) % 7)}>Try another clue</button>
      </div>
    </div>
  );
}

function Poll() {
  const [options, setOptions] = useApi('/api/poll', []);
  const [voted, setVoted] = useState(() => storage.get('mov-voted', false));
  const [live, setLive] = useState(null);
  const results = live || options;
  const total = results.reduce((a, b) => a + b.votes, 0) || 1;

  const vote = async (i) => {
    if (voted) return;
    const r = await api('/api/poll/vote', { option: i });
    setLive(r);
    setVoted(true);
    storage.set('mov-voted', true);
  };

  return (
    <div className="card poll">
      <span className="tag">Poll of the week</span>
      <h3 style={{ fontSize: 19 }}>Which movie genre never gets old?</h3>
      <div>
        {results.map((p, i) => (
          <button className="opt" key={p.label} disabled={voted} onClick={() => vote(i)}>
            <div className="bar" style={{ width: voted ? `${Math.round((p.votes / total) * 100)}%` : 0 }} />
            <span><b>{p.label}</b><b>{voted ? `${Math.round((p.votes / total) * 100)}%` : ''}</b></span>
          </button>
        ))}
      </div>
      <div className="note">{voted ? 'Thanks for voting! Results include everyone who voted.' : 'Tap an option to vote.'}</div>
    </div>
  );
}

function Mood() {
  const [moods] = useApi('/api/moods', {});
  const [pick, setPick] = useState('');
  const m = moods[pick];
  return (
    <div className="card">
      <span className="tag">Movie mood picker</span>
      <label htmlFor="mood" style={{ fontSize: 14, color: 'var(--muted)' }}>I’m feeling…</label>
      <select id="mood" className="field" value={pick} onChange={(e) => setPick(e.target.value)}>
        <option value="">Pick a mood</option>
        {Object.keys(moods).map((k) => <option key={k}>{k}</option>)}
      </select>
      <div className="mood-out">
        {m ? <><span className="tag">Watch tonight</span><b>{m[0]}</b><span style={{ color: 'var(--muted)' }}>{m[1]}</span></> : 'Your recommendation shows up here.'}
      </div>
    </div>
  );
}

export default function PlayZone() {
  return (
    <section id="play">
      <div className="sec-head"><div><h2>Play Zone</h2><p>A daily guess, a weekly poll and a mood picker. Your streak is saved on this device; poll votes are shared.</p></div></div>
      <div className="play-grid"><Quiz /><Poll /><Mood /></div>
    </section>
  );
}
