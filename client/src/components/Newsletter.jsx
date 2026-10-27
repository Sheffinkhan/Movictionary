import { useState } from 'react';
import { api, useApp } from '../lib.js';

export default function Newsletter() {
  const { toast } = useApp();
  const [email, setEmail] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/subscribe', { email });
      toast('You’re on the list!');
      setEmail('');
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <section>
      <div className="nl">
        <div><h2>The Reel Digest</h2><p>One short email a week: new terms, top picks and what’s releasing.</p></div>
        <form onSubmit={submit}>
          <div className="row">
            <label className="sr" htmlFor="nlMail">Email address</label>
            <input id="nlMail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <button className="btn" type="submit">Join</button>
          </div>
          <div className="note" style={{ color: '#3b3205' }}>Emails are saved on the server. Sending the digest is up to you.</div>
        </form>
      </div>
    </section>
  );
}
