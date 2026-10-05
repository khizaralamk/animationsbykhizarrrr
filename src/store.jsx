import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getStats, getHearts, setHeart, track } from "./api.js";
import { VISITORS_BASE } from "./site.js";

/*
  THE SITE'S LIVE NUMBERS
  -----------------------
  One place that knows: the counts for every animation, and which ones this visitor has hearted.
  Any component can read it with useSite().

  Hearts are kept in this browser (so they work at once, and even with no backend) and sent to the
  backend so the public count goes up and the favourites follow the visitor's browser id.
*/
const SiteContext = createContext(null);
const HEARTS_KEY = "abk-hearts";

function savedHearts() {
  try { const list = JSON.parse(localStorage.getItem(HEARTS_KEY) || "[]"); return Array.isArray(list) ? list : []; }
  catch { return []; }
}

export function SiteProvider({ children }) {
  const [stats, setStats] = useState({});                  // { slug: { views, downloads, copies, hearts } }
  const [totals, setTotals] = useState(null);              // null until the backend answers
  const [hearted, setHearted] = useState(() => new Set(savedHearts()));
  const [visitors, setVisitors] = useState(null);          // different visitors so far (base + real), null until known
  const [offers, setOffers] = useState({});                // launch offers: { slug: { limit, left } }
  const seen = useRef(new Set());                         // "slug|kind" already sent this visit

  // Load the counts once, then the visitor's hearts from the backend (it wins over this browser's copy).
  useEffect(() => {
    let alive = true;
    // Say "someone opened the site" first, then read the numbers, so a first time visitor is already in the count.
    // The backend counts a browser once: refreshing or coming back does not add another visitor.
    track("site", "view").finally(() => {
      getStats().then((data) => {
        if (!alive || !data || !data.stats) return;
        setStats(data.stats); setTotals(data.totals);
        if (typeof data.visitors === "number") setVisitors(VISITORS_BASE + data.visitors);
        if (data.offers) setOffers(data.offers);
      });
    });
    getHearts().then((list) => { if (alive && list) setHearted(new Set(list)); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(HEARTS_KEY, JSON.stringify([...hearted])); } catch { /* fine */ }
  }, [hearted]);

  /* Heart or un-heart. The screen changes straight away; the backend's real count replaces the guess when it answers. */
  const toggleHeart = useCallback((slug) => {
    const on = !hearted.has(slug);
    setHearted((old) => { const next = new Set(old); if (on) next.add(slug); else next.delete(slug); return next; });
    setStats((old) => {
      const cur = old[slug] || { views: 0, downloads: 0, copies: 0, hearts: 0 };
      return { ...old, [slug]: { ...cur, hearts: Math.max(0, cur.hearts + (on ? 1 : -1)) } };
    });
    setHeart(slug, on).then((res) => {
      if (res && typeof res.hearts === "number") setStats((old) => ({ ...old, [slug]: { ...(old[slug] || { views: 0, downloads: 0, copies: 0 }), hearts: res.hearts } }));
    });
    return on;
  }, [hearted]);

  /* Record a view, download or copy. Each is sent once per visit, and the number on screen goes up by one. */
  const record = useCallback((slug, kind) => {
    const key = slug + "|" + kind;
    if (seen.current.has(key)) return;
    seen.current.add(key);
    track(slug, kind).then((res) => {
      if (!res || !res.counted) return;                     // already counted today, or no backend
      const field = kind === "view" ? "views" : kind === "download" ? "downloads" : "copies";
      setStats((old) => {
        const cur = old[slug] || { views: 0, downloads: 0, copies: 0, hearts: 0 };
        return { ...old, [slug]: { ...cur, [field]: cur[field] + 1 } };
      });
    });
  }, []);

  const value = useMemo(() => ({
    stats, totals, hearted, toggleHeart, record, visitors,
    statsFor: (slug) => stats[slug] || null,
    offerFor: (slug) => offers[slug] || null,
    isHearted: (slug) => hearted.has(slug),
    live: totals !== null,                                  // true once the backend has answered
  }), [stats, totals, hearted, toggleHeart, record, visitors, offers]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);

/* 1234 -> "1.2k". Small numbers stay as they are. */
export function compact(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, "") + "m";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}
