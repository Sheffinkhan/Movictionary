import { useState } from 'react';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function Media({ post }) {
  const { video, image } = post;
  return (
    <>
      {video?.kind === 'youtube' && (
        <div className="media video">
          <iframe src={video.src} title={post.title} loading="lazy" allowFullScreen
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      )}
      {video?.kind === 'file' && (
        <div className="media video"><video src={video.src} poster={image || undefined} controls preload="metadata" playsInline /></div>
      )}
      {video?.kind === 'link' && (
        <a className="media link-video" href={video.src} target="_blank" rel="noopener">
          <span className="play-dot">▶</span><b>Watch the video</b><small>Opens in a new tab</small>
        </a>
      )}
      {image && video?.kind !== 'file' && (
        <div className="media"><img src={image} alt={post.title} loading="lazy" /></div>
      )}
    </>
  );
}

export default function StoryCard({ post }) {
  const [open, setOpen] = useState(false);
  const long = post.body.length > 240;
  const label = { text: 'Writing', image: 'Photo', video: 'Video' }[post.type];

  return (
    <article className="post">
      <header className="post-head">
        <span className="avatar" aria-hidden="true">mo</span>
        <div><b>movictionary_</b><small>{fmt(post.createdAt)}</small></div>
        <span className="badge">{label}</span>
      </header>
      <Media post={post} />
      <div className="post-body">
        <h3>{post.title}</h3>
        {post.body && <p className={long && !open ? 'clamp' : ''}>{post.body}</p>}
        {long && <button className="copy" onClick={() => setOpen(!open)}>{open ? 'Show less' : 'Read more'}</button>}
      </div>
    </article>
  );
}
