import { createContext, useContext, useEffect, useState } from 'react';

export async function api(url, body) {
  const res = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export function useApi(url, fallback) {
  const [data, setData] = useState(fallback);
  const [error, setError] = useState(null);
  useEffect(() => {
    let live = true;
    setError(null);
    api(url).then((d) => live && setData(d)).catch((e) => live && setError(e));
    return () => { live = false; };
  }, [url]);
  return [data, error];
}

export const storage = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

export function copyText(text, toast) {
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
    .then(() => toast('Copied'))
    .catch(() => toast('Press Ctrl+C to copy'));
}

// Watchlist and toast are shared by every page.
export const AppContext = createContext({ watchlist: [], toggleWatch() {}, toast() {} });
export const useApp = () => useContext(AppContext);
export const INSTAGRAM = 'https://www.instagram.com/movictionary_/';
