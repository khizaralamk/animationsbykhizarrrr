import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { marked } from "marked";
import { bySlug, folderOf, isPaid } from "../animations.js";
import { useSite, compact } from "../store.jsx";
import PixelIcon from "../components/PixelIcon.jsx";
import HeartButton from "../components/HeartButton.jsx";
import NotFound from "./NotFound.jsx";
import PaidPage from "./PaidPage.jsx";

/*
  One animation's page. The animation itself is a complete HTML file in public/animations/<slug>/,
  shown in a frame so it keeps working exactly as the downloadable file does. The frame opens it with
  ?embed=1 so the file hides its own header and follows the site's White / Black choice, and the file
  reports its height so the frame fits it without a scrollbar. Under it: the guides (markdown files
  turned into HTML on the fly).

  Opening the page counts as a view, and each download or copy is counted too (once per visitor per day).
*/
export default function AnimationPage() {
  const { slug } = useParams();
  const { theme } = useOutletContext();
  const a = bySlug(slug);
  const { record, statsFor, live } = useSite();
  const [guides, setGuides] = useState([]);                // [{ title, html }] loaded from the folder's markdown files
  const [frameHeight, setFrameHeight] = useState(900);
  const [copyState, setCopyState] = useState("");          // message next to the Copy HTML button
  const [copyText, setCopyText] = useState("");            // the file text, shown only when the clipboard is blocked

  // Copy HTML: fetch the animation file as text and put the whole thing on the clipboard.
  async function copyHtml() {
    setCopyState("Copying...");
    try {
      const r = await fetch(folderOf(a) + "index.html");
      if (!r.ok) throw new Error("fetch failed");
      const text = await r.text();
      record(a.slug, "copy");
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
    if (a && !isPaid(a)) record(a.slug, "view");
  }, [a, record]);

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
  if (isPaid(a)) return <PaidPage animation={a} />;      // paid animations have their own page: price, what you get, Buy
  const folder = folderOf(a);
  const s = statsFor(a.slug);

  return (
    <div className="page">
      <nav className="crumbs"><Link to="/">Animations</Link><i className="sq" aria-hidden="true" /><span>{a.title}</span></nav>

      <header className="page-head">
        <h1>{a.title}</h1>
        <p className="lead">{a.blurb}</p>

        <ul className="chips" aria-label="About this animation">
          <li><PixelIcon name="screen" size={14} /> {a.screen}</li>
          {live && <li><PixelIcon name="eye" size={14} /> {compact(s ? s.views : 0)} {s && s.views === 1 ? "view" : "views"}</li>}
          {live && <li><PixelIcon name="download" size={14} /> {compact(s ? s.downloads : 0)} {s && s.downloads === 1 ? "download" : "downloads"}</li>}
        </ul>

        <div className="actions">
          <a className="btn primary" href={folder + "index.html"} target="_blank" rel="noopener"><PixelIcon name="expand" size={14} /> Open full screen</a>
          {a.files.map((f) => (
            <a key={f.file} className="btn" href={folder + f.file} download title={f.note} onClick={() => record(a.slug, "download")}>
              <PixelIcon name="download" size={14} /> {f.label}
            </a>
          ))}
          <button type="button" className="btn" onClick={copyHtml} title="Puts the complete HTML file on your clipboard"><PixelIcon name="copy" size={14} /> Copy HTML</button>
          <HeartButton slug={a.slug} title={a.title} className="btn" />
        </div>
        {copyState && <p className="note" aria-live="polite">{copyState}</p>}
        {copyText && (
          <textarea className="copy-fallback" readOnly value={copyText} aria-label="The complete HTML file"
            ref={(el) => { if (el) { el.focus(); el.select(); } }} />
        )}
      </header>

      <section className="frame-wrap px-box" aria-label={`${a.title} live preview`}>
        <iframe
          key={a.slug}
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
    </div>
  );
}
