import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { newestFirst, isPaid } from "../animations.js";
import { useSite, compact } from "../store.jsx";
import AnimationCard from "../components/AnimationCard.jsx";
import HeroScreen from "../components/HeroScreen.jsx";
import PixelIcon from "../components/PixelIcon.jsx";

const TABS = [
  { key: "free", label: "Free" },
  { key: "paid", label: "Paid" },
  { key: "favourites", label: "Favourites" },
];
const SORTS = [
  { key: "new", label: "Newest" },
  { key: "downloads", label: "Most downloaded" },
  { key: "hearts", label: "Most hearts" },
];
const SEARCH_DELAY_MS = 250;      // how long the search waits after the last key press before filtering
const TICKER = ["128 x 64 pixels", "1 bit per pixel", "ESP32 ready", "SSD1306 and SH1106", "one HTML file each", "works offline", "free to download"];

/*
  The home page: a hero with a live OLED, then the library in three tabs (Free, Paid, Favourites)
  with a sort choice, then the three steps from browser to board.
  The open tab lives in the address (?tab=paid), so it can be linked and survives a refresh.
*/
export default function Home() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "free";
  const [sort, setSort] = useState("new");
  const { stats, totals, hearted, live } = useSite();
  const root = useRef(null);

  // Search. "query" is what is in the box right now; "term" follows it a moment later (debouncing),
  // so the cards are not re-filtered on every single key press while someone is still typing.
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim().toLowerCase()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);                       // a new key press cancels the wait and starts it again
  }, [query]);

  const all = useMemo(() => newestFirst(), []);
  // An animation matches when every word typed appears somewhere in its title, blurb, tags or screen.
  const matches = useMemo(() => {
    if (!term) return all;
    const words = term.split(/\s+/);
    return all.filter((a) => {
      const text = [a.title, a.blurb, a.screen, ...(a.tags || [])].join(" ").toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [all, term]);
  const lists = useMemo(() => ({
    free: matches.filter((a) => !isPaid(a)),
    paid: matches.filter(isPaid),
    favourites: matches.filter((a) => hearted.has(a.slug)),
  }), [matches, hearted]);

  const list = useMemo(() => {
    const items = [...lists[tab]];
    if (sort !== "new" && live) {
      const field = sort === "downloads" ? "downloads" : "hearts";
      items.sort((a, b) => ((stats[b.slug] || {})[field] || 0) - ((stats[a.slug] || {})[field] || 0));
    }
    return items;
  }, [lists, tab, sort, stats, live]);

  useEffect(() => { document.title = "OLED Animations"; }, []);

  // One entrance when the page opens: the headline steps in, the screen switches on. Then nothing moves by itself.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "steps(6)" } });
      tl.from(".hero-title .line", { yPercent: 110, duration: 0.5, stagger: 0.09 })
        .from(".hero-copy > .lead, .hero-copy > .actions, .hero-copy > .chips", { opacity: 0, y: 12, duration: 0.35, stagger: 0.07 }, "-=0.2")
        .from(".hero-screen .module", { scaleY: 0.03, transformOrigin: "50% 50%", duration: 0.45 }, 0.1);
    }, root);
    return () => mm.revert();
  }, []);

  // When the visitor changes tab or sort, the cards step in. This answers their click, so it is not decoration.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-reveal]", { opacity: 0, y: 18, duration: 0.3, stagger: 0.05, ease: "steps(4)", clearProps: "all" });
    }, root);
    return () => mm.revert();
  }, [tab, sort, term]);

  const setTab = (key) => setParams(key === "free" ? {} : { tab: key }, { replace: true });
  const heroList = useMemo(() => { const free = all.filter((a) => !isPaid(a)); return free.length ? free : all; }, [all]);
  // If the search found nothing in this tab but did in another, say where.
  const elsewhere = term && list.length === 0 ? TABS.find((t) => t.key !== tab && t.key !== "favourites" && lists[t.key].length > 0) : null;

  return (
    <div ref={root} className="home">
      {/* ---------- hero ---------- */}
      <section className="hero-glass px-box">
        <div className="hero-copy">
          <h1 className="hero-title"><span className="clip"><span className="line">OLED</span></span><span className="clip"><span className="line">animations</span></span></h1>
          <p className="lead">Made for the little 128 by 64 screens. Try one in your browser, download it, and upload the sketch to your ESP32.</p>
          <div className="actions">
            <a className="btn primary" href="#library"><PixelIcon name="arrow" size={14} /> Browse animations</a>
            <Link className="btn" to="/make-your-own">Make your own</Link>
          </div>
          <ul className="chips" aria-label="Site numbers">
            <li><PixelIcon name="screen" size={14} /> {all.length} animations</li>
            {live && totals && totals.downloads > 0 && <li><PixelIcon name="download" size={14} /> {compact(totals.downloads)} downloads</li>}
            {live && totals && totals.hearts > 0 && <li><PixelIcon name="heart" size={14} /> {compact(totals.hearts)} hearts</li>}
          </ul>
        </div>
        <HeroScreen animations={heroList} />
      </section>

      {/* ---------- ticker ---------- */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((n) => (
            <span key={n} className="ticker-set">{TICKER.map((t) => <span key={t}><i className="sq" />{t}</span>)}</span>
          ))}
        </div>
      </div>

      {/* ---------- the library ---------- */}
      <section id="library" aria-label="Animations">
        <div className="library-head">
          <div className="tabs" role="tablist" aria-label="Which animations to show">
            {TABS.map((t) => (
              <button key={t.key} role="tab" id={"tab-" + t.key} aria-selected={tab === t.key} aria-controls="tab-panel" className="tab" onClick={() => setTab(t.key)}>
                {t.key === "favourites" && <PixelIcon name="heart" size={13} />} {t.label} <span className="count">{lists[t.key].length}</span>
              </button>
            ))}
          </div>
          <div className="tools">
            <label className="search">
              <PixelIcon name="search" size={15} />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search animations"
                aria-label="Search animations" autoComplete="off" spellCheck="false" enterKeyHint="search" />
              {query && <button type="button" className="clear" aria-label="Clear the search" onClick={() => setQuery("")}><PixelIcon name="close" size={11} /></button>}
            </label>
            {live && (
              <label className="sort">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>

        <div id="tab-panel" role="tabpanel" aria-labelledby={"tab-" + tab}>
          {tab === "paid" && (
            <p className="licence"><b>Pay once, use it anywhere.</b> When you buy an animation you can use it in commercial products however you want.</p>
          )}

          {term && <p className="note" aria-live="polite">{list.length} {list.length === 1 ? "result" : "results"} for "{term}" in {TABS.find((t) => t.key === tab).label}.</p>}

          {term && list.length === 0 ? (
            <div className="empty px-box">
              <PixelIcon name="search" size={34} />
              <h2>Nothing matches "{term}"</h2>
              <p className="note">{elsewhere ? `There ${lists[elsewhere.key].length === 1 ? "is 1 match" : `are ${lists[elsewhere.key].length} matches`} under ${elsewhere.label}.` : "Try a shorter word, like glitch, eyes or dance."}</p>
              <div className="actions">
                {elsewhere && <button className="btn primary" onClick={() => setTab(elsewhere.key)}>Show {elsewhere.label}</button>}
                <button className="btn" onClick={() => setQuery("")}>Clear the search</button>
              </div>
            </div>
          ) : list.length > 0 ? (
            <div className="grid">
              {/* the first cards are on screen straight away, so their pictures load first */}
              {list.map((a, i) => <AnimationCard key={a.slug} animation={a} isNew={tab === "free" && sort === "new" && !term && i === 0} eager={i < 3} />)}
            </div>
          ) : tab === "favourites" ? (
            <div className="empty px-box">
              <PixelIcon name="heartLine" size={34} />
              <h2>No favourites yet</h2>
              <p className="note">Press the heart on any animation and it shows up here, in this browser.</p>
              <button className="btn" onClick={() => setTab("free")}>Browse the free ones</button>
            </div>
          ) : (
            <div className="empty px-box">
              <PixelIcon name="lock" size={34} />
              <h2>Nothing here yet</h2>
              <p className="note">Paid animations will show up here when they are ready. Everything under Free is yours to download today.</p>
              <button className="btn" onClick={() => setTab("free")}>See the free ones</button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- from browser to board: a real sequence, so the steps are numbered ---------- */}
      <section className="steps" aria-label="How it works">
        <h2>From this page to your board</h2>
        <ol>
          <li className="px-box"><span className="n">1</span><PixelIcon name="screen" size={26} /><h3>Try it</h3><p className="note">Every animation runs here on a simulated screen. Change the size, speed and style until it looks right.</p></li>
          <li className="px-box"><span className="n">2</span><PixelIcon name="download" size={26} /><h3>Take it</h3><p className="note">Download the page or copy the whole Arduino sketch, with your settings already filled in.</p></li>
          <li className="px-box"><span className="n">3</span><PixelIcon name="chip" size={26} /><h3>Upload it</h3><p className="note">Paste the sketch into the Arduino IDE and press Upload. Each animation has a guide with every click.</p></li>
        </ol>
      </section>
    </div>
  );
}
