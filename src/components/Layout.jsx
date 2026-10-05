import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Lenis from "lenis";
import PixelIcon from "./PixelIcon.jsx";
import { useSite } from "../store.jsx";
import { LEGAL_PAGES, SUPPORT_EMAIL } from "../site.js";

/* Reads the saved page look. Storage can be blocked, so every read and write is wrapped. */
function savedTheme() {
  try { return localStorage.getItem("abk-theme") || "light"; } catch { return "light"; }
}

/*
  The frame around every page: top bar, then the page, then the footer.
  On wide screens the top bar shows its links in a row. On phones and small tablets the links
  move into a drawer that opens from the two line button on the right.
  It also runs the smooth scrolling (Lenis), which is switched off for visitors who asked their
  system for less motion.
*/
export default function Layout() {
  const [theme, setTheme] = useState(savedTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const lenis = useRef(null);
  const { hearted, visitors } = useSite();

  useEffect(() => {
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("abk-theme", theme); } catch { /* fine */ }
  }, [theme]);

  // Smooth scrolling for mouse wheels. Touch screens keep their own native scrolling.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.14, wheelMultiplier: 1, smoothWheel: true });
    lenis.current = l;
    let frame = requestAnimationFrame(function loop(t) { l.raf(t); frame = requestAnimationFrame(loop); });
    return () => { cancelAnimationFrame(frame); l.destroy(); lenis.current = null; };
  }, []);

  // A new page starts at the top, and the drawer closes.
  useEffect(() => {
    setMenuOpen(false);
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";                 // the page behind the drawer does not scroll
    if (lenis.current) lenis.current.stop();
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; if (lenis.current) lenis.current.start(); };
  }, [menuOpen]);

  // The same links and theme buttons are used in the row (wide screens) and in the drawer (small screens).
  const navItems = (
    <>
      <NavLink className="nav-link" to="/" end>Animations</NavLink>
      <Link className="nav-link" to="/?tab=favourites">
        Favourites{hearted.size > 0 && <span className="pill">{hearted.size}</span>}
      </Link>
      <NavLink className="nav-link" to="/make-your-own">Make your own</NavLink>
      <div className="theme-switch" role="group" aria-label="Page look">
        <button className="btn small" aria-pressed={theme === "light"} onClick={() => setTheme("light")}><PixelIcon name="sun" size={14} /> White</button>
        <button className="btn small" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}><PixelIcon name="moon" size={14} /> Black</button>
      </div>
      {/* How many different people have visited. Shown once the backend has answered. */}
      {visitors !== null && (
        <span className="visitors" title="Different visitors so far. Refreshing does not count again.">
          <PixelIcon name="eye" size={14} /> <b>{visitors.toLocaleString()}</b> visitors
        </span>
      )}
    </>
  );

  return (
    <div className="wrap">
      <header className="topbar">
        <Link to="/" className="wordmark"><img src="/favicon.svg" alt="" width="28" height="28" />Hi from <b>Khizar!</b></Link>

        <nav className="nav-row" aria-label="Site">{navItems}</nav>

        <button className="menu-btn" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="drawer" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span>
        </button>
      </header>

      {/* The drawer for small screens */}
      <div className={"drawer-shade" + (menuOpen ? " open" : "")} onClick={() => setMenuOpen(false)} aria-hidden="true"></div>
      <nav id="drawer" className={"drawer" + (menuOpen ? " open" : "")} aria-label="Site" aria-hidden={!menuOpen} inert={menuOpen ? undefined : ""}>
        <div className="drawer-head">
          <span className="label">Menu</span>
          <button className="menu-btn open" aria-label="Close menu" onClick={() => setMenuOpen(false)}><span></span><span></span></button>
        </div>
        {navItems}
      </nav>

      <main><Outlet context={{ theme }} /></main>

      <footer className="footer">
        <div className="footer-row">
          <span className="wordmark small"><img src="/favicon.svg" alt="" width="20" height="20" />Hi from <b>Khizar!</b></span>
          <span className="footer-links">
            <Link to="/">Animations</Link>
            <Link to="/?tab=paid">Paid</Link>
            <Link to="/make-your-own">Make your own</Link>
          </span>
        </div>
        <div className="footer-row">
          <span className="footer-links small">{LEGAL_PAGES.map((p) => <Link key={p.path} to={"/" + p.path}>{p.title}</Link>)}</span>
          <a className="footer-mail" href={"mailto:" + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a>
        </div>
        <p className="note">Every animation is one HTML file you can keep, plus a sketch for an ESP32 where there is one. Counts are anonymous: no names and no IP addresses are stored. Payments are handled by Paddle.</p>
      </footer>
    </div>
  );
}
