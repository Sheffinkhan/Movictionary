import { useState } from 'react';
import { INSTAGRAM, useApi } from '../lib.js';
import StoryCard from '../components/StoryCard.jsx';

const FILTERS = [['all', 'All'], ['text', 'Writing'], ['image', 'Photos'], ['video', 'Videos']];

export default function Stories() {
  const [type, setType] = useState('all');
  const [posts] = useApi(`/api/posts?type=${type}`, []);

  return (
    <section id="stories">
      <div className="sec-head">
        <div><h2>Stories</h2><p>Writing, photos and videos about Malayalam cinema, newest first.</p></div>
        <div className="chips">
          {FILTERS.map(([key, label]) => <button key={key} className="chip" aria-pressed={type === key} onClick={() => setType(key)}>{label}</button>)}
        </div>
      </div>
      <div className="feed">
        {posts.length
          ? posts.map((p) => <StoryCard key={p.id} post={p} />)
          : <div className="empty">Nothing here yet. Check back soon, or follow <a href={INSTAGRAM} target="_blank" rel="noopener">@movictionary_</a> for the latest.</div>}
      </div>
    </section>
  );
}
