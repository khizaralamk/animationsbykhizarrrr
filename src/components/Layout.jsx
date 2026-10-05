import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

/* Reads the saved page look. Storage can be blocked, so every read and write is wrapped. */
function savedTheme() {
  try { return localStorage.getItem("abk-theme") || "light"; } catch { return "light"; }
}

/*
  The frame around every page: top bar, then the page, then the footer.
  On wide screens the top bar shows its links in a row. On phones and small tablets the
  links move into a drawer that opens from the two line button on the right.
*/
export default function Layout() {
  const [theme, setTheme] = useState(savedTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("abk-theme", theme); } catch { /* fine */ }
  }, [theme]);

  // Close the drawer when the page changes, and when Escape is pressed.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";                 // the page behind the drawer does not scroll
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [menuOpen]);

  // The same links and theme buttons are used in the row (wide screens) and in the drawer (small screens).
  const navItems = (
    <>
      <Link className="button" to="/make-your-own">Make your own</Link>
      <div className="theme-switch" role="group" aria-label="Page look">
        <span className="label">Page</span>
        <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>White</button>
        <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Black</button>
      </div>
    </>
  );

  return (
    <div className="wrap">
      <div className="topbar">
        <Link to="/" className="wordmark"><img src="/favicon.svg" alt="" width="30" height="30" />Hi from <b>Khizar!</b></Link>

        <nav className="nav-row" aria-label="Site">{navItems}</nav>

        <button className="menu-btn" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="drawer" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span>
        </button>
      </div>

      {/* The drawer for small screens */}
      <div className={"drawer-shade" + (menuOpen ? " open" : "")} onClick={() => setMenuOpen(false)} aria-hidden="true"></div>
      <nav id="drawer" className={"drawer" + (menuOpen ? " open" : "")} aria-label="Site" aria-hidden={!menuOpen} inert={menuOpen ? undefined : ""}>
        <div className="drawer-head">
          <span className="label">Menu</span>
          <button className="menu-btn open" aria-label="Close menu" onClick={() => setMenuOpen(false)}><span></span><span></span></button>
        </div>
        {navItems}
      </nav>

      <Outlet context={{ theme }} />

      <footer>
        <p>Every animation is one HTML file you can keep, plus a sketch for an ESP32 where there is one.</p>      </footer>
    </div>
  );
}
