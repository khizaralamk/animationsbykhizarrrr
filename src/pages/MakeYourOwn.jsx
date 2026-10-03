import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { marked } from "marked";

// The guide and the starter sketch live with the Spidey Transitions files, so there is one copy of each.
const FOLDER = "/animations/spidey-transitions/";

/* The "Make your own" page: the guide (a markdown file turned into HTML) with the starter sketch downloads on top. */
export default function MakeYourOwn() {
  const [html, setHtml] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.title = "Make your own | OLED Animations";
    window.scrollTo(0, 0);
    let alive = true;
    fetch(FOLDER + "make-your-own.md")
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.text(); })
      // the page already shows the title, so drop the first heading of the file
      .then((md) => { if (alive) setHtml(marked.parse(md.replace(/^# .*\n/, ""))); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  return (
    <>
      <nav className="crumbs"><Link to="/">All animations</Link><span aria-hidden="true">/</span><span>Make your own</span></nav>

      <header className="hero compact">
        <p className="kicker">Any image, an ESP32 and a 128 by 64 OLED</p>
        <h1>Make your own</h1>
        <p className="lead">How the glitch slideshow works and how to build one with your own pictures. No coding needed, only copy, paste and Upload.</p>
        <div className="actions">
          <a className="button primary" href={FOLDER + "MakeYourOwn/MakeYourOwn.ino"} download>Download the starter sketch</a>
          <a className="button" href={FOLDER + "MakeYourOwn/pictures.h"} download>Download pictures.h</a>
          <a className="button" href="https://javl.github.io/image2cpp/" target="_blank" rel="noopener">Open image2cpp</a>
          <Link className="button" to="/a/spidey-transitions">See Spidey Transitions</Link>
        </div>
        <p className="note">Put both downloaded files in one folder named MakeYourOwn, then open MakeYourOwn.ino in the Arduino IDE.</p>
      </header>

      <section className="guide">
        {html && <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />}
        {failed && <p className="note">The guide could not be loaded. Try again in a moment.</p>}
      </section>
    </>
  );
}
