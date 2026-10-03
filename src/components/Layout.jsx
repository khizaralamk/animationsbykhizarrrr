import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

const REPO = "https://github.com/KhizarAlam20/animationsbykhizarrrr";

/* Reads the saved page look. Storage can be blocked, so every read and write is wrapped. */
function savedTheme() {
  try { return localStorage.getItem("abk-theme") || "light"; } catch { return "light"; }
}

/* The frame around every page: top bar with the wordmark and the White / Black switch, then the page, then the footer. */
export default function Layout() {
  const [theme, setTheme] = useState(savedTheme);

  useEffect(() => {
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("abk-theme", theme); } catch { /* fine */ }
  }, [theme]);

  return (
    <div className="wrap">
      <div className="topbar">
        <Link to="/" className="wordmark">OLED <b>Animations</b></Link>
        <div className="actions">
          <a className="button" href={REPO} target="_blank" rel="noopener">GitHub</a>
          <span className="label">Page</span>
          <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>White</button>
          <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Black</button>
        </div>
      </div>

      <Outlet context={{ theme }} />

      <footer>
        <p>Every animation is one HTML file you can keep, plus a sketch for an ESP32 where there is one.</p>
        <p>The code is on <a href={REPO} target="_blank" rel="noopener">GitHub</a>. If it helped you, please drop a star on the repo.</p>
      </footer>
    </div>
  );
}
