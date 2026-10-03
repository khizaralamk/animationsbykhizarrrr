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
  folder has them, the guides (markdown files turned into HTML on the fly).
*/
export default function AnimationPage() {
  const { slug } = useParams();
  const { theme } = useOutletContext();
  const a = bySlug(slug);
  const [guides, setGuides] = useState([]);                // [{ title, html }] loaded from the folder's markdown files
  const [frameHeight, setFrameHeight] = useState(900);
  const [copyState, setCopyState] = useState("");       // message next to the Copy HTML button
  const [copyText, setCopyText] = useState("");         // the file text, shown only when the clipboard is blocked

  // Copy HTML: fetch the animation file as text and put the whole thing on the clipboard.
  async function copyHtml() {
    setCopyState("Copying...");
    try {
      const r = await fetch(folderOf(a) + "index.html");
      if (!r.ok) throw new Error("fetch failed");
      const text = await r.text();
      try {
        await navigator.clipboard.writeText(text);
        setCopyState(`Copied. ${text.length.toLocaleString()} characters, the complete ${a.slug}.html file.`);
        setCopyText("");
      } catch {
        // The clipboard can be blocked (http, older browsers): show the text selected so Ctrl+C works.
        setCopyText(text);
        setCopyState("Copy is blocked in this browser. The file is selected below, press Ctrl+C or Cmd+C.");
      }
    } catch {
      setCopyState("Could not load the file. Use Download the page instead.");
    }
  }

  useEffect(() => {
    document.title = a ? `${a.title} | OLED Animations` : "Not found | OLED Animations";
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
    if (!a || !a.guides || !a.guides.length) { setGuides([]); return; }
    let alive = true;
    Promise.all(a.guides.map((g) =>
      fetch(folderOf(a) + g.file)
        .then((r) => (r.ok ? r.text() : ""))
        // the section already has a heading, so drop the file's own first title line
        .then((md) => ({ title: g.title, html: md ? marked.parse(md.replace(/^# .*\n/, "")) : "" }))
        .catch(() => ({ title: g.title, html: "" }))
    )).then((list) => { if (alive) setGuides(list.filter((g) => g.html)); });
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
          <button type="button" onClick={copyHtml} title="Puts the complete HTML file on your clipboard">Copy HTML</button>
          {copyState && <span className="note" aria-live="polite">{copyState}</span>}
        </div>
        {copyText && (
          <textarea className="copy-fallback" readOnly value={copyText} aria-label="The complete HTML file"
            ref={(el) => { if (el) { el.focus(); el.select(); } }} />
        )}
      </header>

      <section className="frame-wrap" aria-label={`${a.title} live preview`}>
        <iframe
          className="frame"
          src={`${folder}index.html?embed=1&theme=${theme}`}
          style={{ height: frameHeight }}
          title={`${a.title} live preview`}
        />
      </section>

      {guides.map((g) => (
        <section className="guide" key={g.title}>
          <h2>{g.title}</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: g.html }} />
        </section>
      ))}
    </>
  );
}
