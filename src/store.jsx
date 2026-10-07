import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getStats, getHearts, setHeart, track, isNewVisitor } from "./api.js";
import { VISITORS_BASE } from "./site.js";

/*
  THE SITE'S LIVE NUMBERS
  -----------------------
  One place that knows: the counts for every animation, and which ones this visitor has hearted.
  Any component can read it with useSite().

  Hearts are kept in this browser (so they work at once, and even with no backend) and sent to the
  backend so the public count goes up and the favourites follow the visitor's browser id.

  The numbers show up fast in three ways:
    1. The last numbers this browser saw are kept (STATS_KEY) and shown straight away on the next
       visit, then swapped for the fresh ones when they arrive.
    2. The request for fresh numbers starts as early as possible: index.html starts it before this
       code has loaded, and it does not wait for anything else (like the "opened the site" event).
    3. The backend's answer comes from Vercel's CDN, so it does not wait for the database.
*/
const SiteContext = createContext(null);
const HEARTS_KEY = "abk-hearts";
const STATS_KEY = "abk-stats";
const STATS_MAX_AGE = 7 * 24 * 60 * 60 * 1000;            // a saved copy older than a week is not shown
const OLD_ANSWER = 60 * 1000;                             // an answer made longer ago than this is asked for again, once
const ASK_AGAIN_AFTER = 3000;                              // by then the CDN has made a fresh copy in the background

function savedHearts() {
  try { const list = JSON.parse(localStorage.getItem(HEARTS_KEY) || "[]"); return Array.isArray(list) ? list : []; }
  catch { return []; }
}

/* The numbers this browser saw last time, or null. Only real answers from the backend are ever saved. */
function savedStats() {
  try {
    const data = JSON.parse(localStorage.getItem(STATS_KEY) || "null");
    if (data && data.stats && data.totals && typeof data.savedAt === "number" && Date.now() - data.savedAt < STATS_MAX_AGE) return data;
  } catch { /* fine */ }
  return null;
}

function saveStats(data) {
  try {
    const { stats, totals, visitors, offers } = data;
    localStorage.setItem(STATS_KEY, JSON.stringify({ stats, totals, visitors, offers, savedAt: Date.now() }));
  } catch { /* fine */ }
}

// Ask for the numbers as soon as this file loads, not after the first render.
const saved = savedStats();
const firstStats = getStats();

export function SiteProvider({ children }) {
  const [stats, setStats] = useState(() => (saved ? saved.stats : {}));  // { slug: { views, downloads, copies, hearts } }
  const [totals, setTotals] = useState(() => (saved ? saved.totals : null)); // null until there are numbers to show
  const [hearted, setHearted] = useState(() => new Set(savedHearts()));
  const [visitorCount, setVisitorCount] = useState(() => (saved && typeof saved.visitors === "number" ? saved.visitors : null));
  const [joined, setJoined] = useState(0);                 // 1 once this browser's first ever visit has been counted
  const [offers, setOffers] = useState(() => (saved && saved.offers) || {});  // launch offers: { slug: { limit, left } }
  const seen = useRef(new Set());                         // "slug|kind" already sent this visit

  // Load the counts once, then the visitor's hearts from the backend (it wins over this browser's copy).
  useEffect(() => {
    let alive = true, again = null;
    const show = (data) => {
      if (!alive || !data || !data.stats) return;
      setStats(data.stats); setTotals(data.totals);
      if (typeof data.visitors === "number") setVisitorCount(data.visitors);
      if (data.offers) setOffers(data.offers);
      saveStats(data);
    };
    firstStats.then((data) => {
      show(data);
      // The CDN may have answered with a copy made a while ago (after a quiet spell). It is making a
      // fresh one in the background now, so ask once more a moment later. "at" is when the copy was made.
      if (alive && data && typeof data.at === "number" && Date.now() - data.at > OLD_ANSWER) {
        again = setTimeout(() => getStats().then(show), ASK_AGAIN_AFTER);
      }
    });

    // Say "someone opened the site". The numbers do not wait for this. The backend counts a browser
    // once: refreshing or coming back does not add another visitor. A browser here for the very first
    // time is not in the numbers above yet, so it is added on screen once the backend has counted it.
    const firstVisit = isNewVisitor();
    track("site", "view").then((res) => { if (alive && firstVisit && res && res.counted) setJoined(1); });

    getHearts().then((list) => { if (alive && list) setHearted(new Set(list)); });
    return () => { alive = false; if (again) clearTimeout(again); };
  }, []);

  // Different visitors so far (base + real, plus this browser on its first visit), null until known.
  const visitors = visitorCount === null ? null : VISITORS_BASE + visitorCount + joined;

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
    live: totals !== null,                                  // true once there are numbers: saved from last time, or from the backend
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
