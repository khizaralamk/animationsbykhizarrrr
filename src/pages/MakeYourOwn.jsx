import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { marked } from "marked";
import PixelIcon from "../components/PixelIcon.jsx";

// The guide and the starter sketch live with the Spidey Transitions files, so there is one copy of each.
const FOLDER = "/animations/spidey-transitions/";

/* The "Make your own" page: the guide (a markdown file turned into HTML) with the starter sketch downloads on top. */
export default function MakeYourOwn() {
  const [html, setHtml] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.title = "Make your own | OLED Animations";
    let alive = true;
    fetch(FOLDER + "make-your-own.md")
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.text(); })
      // the page already shows the title, so drop the first heading of the file
      .then((md) => { if (alive) setHtml(marked.parse(md.replace(/^# .*\n/, ""))); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="page">
      <nav className="crumbs"><Link to="/">Animations</Link><i className="sq" aria-hidden="true" /><span>Make your own</span></nav>

      <header className="page-head">
        <h1>Make your own</h1>
        <p className="lead">How the glitch slideshow works and how to build one with your own pictures. No coding needed, only copy, paste and Upload.</p>
        <div className="actions">
          <a className="btn primary" href={FOLDER + "MakeYourOwn/MakeYourOwn.ino"} download><PixelIcon name="download" size={14} /> Starter sketch</a>
          <a className="btn" href={FOLDER + "MakeYourOwn/pictures.h"} download><PixelIcon name="download" size={14} /> pictures.h</a>
          <a className="btn" href="https://javl.github.io/image2cpp/" target="_blank" rel="noopener"><PixelIcon name="expand" size={14} /> Open image2cpp</a>
          <Link className="btn" to="/a/spidey-transitions">See Spidey Transitions</Link>
        </div>
        <p className="note">Put both downloaded files in one folder named MakeYourOwn, then open MakeYourOwn.ino in the Arduino IDE.</p>
      </header>

      <section className="guide">
        {html && <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />}
        {failed && <p className="note">The guide could not be loaded. Try again in a moment.</p>}
      </section>
    </div>
  );
}
