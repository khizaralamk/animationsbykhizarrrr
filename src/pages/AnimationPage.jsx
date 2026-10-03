import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { marked } from "marked";
import { bySlug, folderOf } from "../animations.js";
import NotFound from "./NotFound.jsx";

/*
  One animation's page. The animation itself is a complete HTML file in public/animations/<slug>/,
  shown in a frame so it keeps working exactly as the downloadable file does. The frame opens it with
  ?embed=1 so the file hides its own header and follows the site's White / Black choice, and the file
  reports its height so the frame fits it without a scrollbar. Under it: the downloads and, when the
  folder has one, the set up guide (a markdown file turned into HTML on the fly).
*/
export default function AnimationPage() {
  const { slug } = useParams();
  const { theme } = useOutletContext();
  const a = bySlug(slug);
  const [guideHtml, setGuideHtml] = useState("");
  const [frameHeight, setFrameHeight] = useState(900);

  useEffect(() => {
    document.title = a ? `${a.title} | Animations by Khizar` : "Not found | Animations by Khizar";
    window.scrollTo(0, 0);
  }, [a]);

  // The embedded page sends { abkHeight } whenever its size changes.
  useEffect(() => {
    const onMessage = (e) => {
      if (e.data && typeof e.data.abkHeight === "number") setFrameHeight(Math.max(400, Math.ceil(e.data.abkHeight)));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!a || !a.guide) { setGuideHtml(""); return; }
    let alive = true;
    fetch(folderOf(a) + a.guide)
      .then((r) => (r.ok ? r.text() : ""))
      .then((md) => { if (alive) setGuideHtml(md ? marked.parse(md) : ""); })
      .catch(() => { if (alive) setGuideHtml(""); });
    return () => { alive = false; };
  }, [a]);

  if (!a) return <NotFound />;
  const folder = folderOf(a);

  return (
    <>
      <nav className="crumbs"><Link to="/">All animations</Link><span aria-hidden="true">/</span><span>{a.title}</span></nav>

      <header className="hero compact">
        <p className="kicker">{a.screen}</p>
        <h1>{a.title}</h1>
        <p className="lead">{a.blurb}</p>
        <div className="actions">
          <a className="button primary" href={folder + "index.html"} target="_blank" rel="noopener">Open full screen</a>
          {a.files.map((f) => (
            <a key={f.file} className="button" href={folder + f.file} download title={f.note}>{f.label}</a>
          ))}
        </div>
      </header>

      <section className="frame-wrap" aria-label={`${a.title} live preview`}>
        <iframe
          className="frame"
          src={`${folder}index.html?embed=1&theme=${theme}`}
          style={{ height: frameHeight }}
          title={`${a.title} live preview`}
        />
      </section>

      {guideHtml && (
        <section className="guide" aria-labelledby="guide-head">
          <h2 id="guide-head">How to put it on your board</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: guideHtml }} />
        </section>
      )}
    </>
  );
}
