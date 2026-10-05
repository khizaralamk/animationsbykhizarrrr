import { useEffect } from "react";
import { Link } from "react-router-dom";
import { folderOf } from "../animations.js";

/*
  The page for a paid animation. It shows what the buyer gets and one Buy button that goes to the
  checkout page (a.buyUrl). The animation's own files are NOT on this site: anything in public/ can
  be downloaded by anyone, so the checkout service is what hands the files over after payment.
  Only the card picture, and an optional preview picture, live here.
*/
export default function PaidPage({ animation }) {
  const a = animation;
  const folder = folderOf(a);

  useEffect(() => {
    document.title = `${a.title} | OLED Animations`;
    window.scrollTo(0, 0);
  }, [a]);

  return (
    <>
      <nav className="crumbs"><Link to="/?tab=paid">Paid animations</Link><span aria-hidden="true">/</span><span>{a.title}</span></nav>

      <header className="hero compact">
        <p className="kicker">{a.screen}</p>
        <h1>{a.title}</h1>
        <p className="lead">{a.blurb}</p>
        <div className="actions">
          {a.buyUrl
            ? <a className="button primary" href={a.buyUrl} target="_blank" rel="noopener">Buy for {a.price}</a>
            : <span className="button primary" aria-disabled="true">Coming soon, {a.price}</span>}
          <span className="note">Payment and download happen on the checkout page. You get the files straight after paying.</span>
        </div>
      </header>

      <section className="paid-preview" aria-label={`${a.title} preview`}>
        <img src={folder + (a.preview || "thumb.png")} alt={`${a.title} on a 128 by 64 OLED`} width="512" height="256" />
      </section>

      {a.includes && a.includes.length > 0 && (
        <section className="guide">
          <h2>What you get</h2>
          <ul className="prose">
            {a.includes.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>
      )}
    </>
  );
}
