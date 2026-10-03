import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

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
        <Link to="/" className="wordmark">Animations <b>by Khizar</b></Link>
        <div className="actions" role="group" aria-label="Page look">
          <span className="label">Page</span>
          <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>White</button>
          <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Black</button>
        </div>
      </div>

      <Outlet context={{ theme }} />

      <footer>
        <p>Every animation is one HTML file you can keep, plus a sketch for an ESP32 where there is one. Made for 128 by 64 OLED screens.</p>
      </footer>
    </div>
  );
}
