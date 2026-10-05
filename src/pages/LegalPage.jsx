import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { marked } from "marked";
import { LEGAL_PAGES, SUPPORT_EMAIL } from "../site.js";

/*
  One page for all the small print: Support, Refunds, Terms, Privacy, Licence.
  Each is a markdown file in public/legal/, so the wording can be changed without touching code.
  In those files, {{email}} is replaced with the support address from src/site.js.
*/
export default function LegalPage({ page }) {
  const [html, setHtml] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.title = `${page.title} | OLED Animations`;
    setHtml(""); setFailed(false);
    let alive = true;
    fetch("/legal/" + page.file)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.text(); })
      .then((md) => { if (alive) setHtml(marked.parse(md.replace(/^# .*\n/, "").replaceAll("{{email}}", SUPPORT_EMAIL))); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [page]);

  return (
    <div className="page">
      <nav className="crumbs"><Link to="/">Animations</Link><i className="sq" aria-hidden="true" /><span>{page.title}</span></nav>
      <header className="page-head">
        <h1>{page.title}</h1>
        <div className="actions">
          {LEGAL_PAGES.filter((p) => p.path !== page.path).map((p) => <Link key={p.path} className="btn small" to={"/" + p.path}>{p.title}</Link>)}
        </div>
      </header>
      <section className="guide">
        {html && <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />}
        {failed && <p className="note">This page could not be loaded. Write to {SUPPORT_EMAIL} if you need it.</p>}
      </section>
    </div>
  );
}
