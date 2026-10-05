import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { folderOf } from "../animations.js";
import { startCheckout, hasBackend } from "../api.js";
import PixelIcon from "../components/PixelIcon.jsx";
import HeartButton from "../components/HeartButton.jsx";

/*
  The page for a paid animation: what the buyer gets and one Buy button.

  Pressing Buy asks the backend for a checkout page at Polar (the payment service) and sends the
  visitor there. Card details never touch this site. After paying, Polar sends them back to /thanks,
  which shows the download links.

  The animation's own files are NOT on this site: anything in public/ can be downloaded by anyone.
  They live in a private storage bucket and are only handed out after payment.
  Only the card picture, and an optional preview picture, live here.
*/
export default function PaidPage({ animation }) {
  const a = animation;
  const folder = folderOf(a);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const forSale = Boolean(a.polarProductId && hasBackend) || Boolean(a.buyUrl);

  useEffect(() => { document.title = `${a.title} | OLED Animations`; }, [a]);

  async function buy() {
    setProblem("");
    if (!(a.polarProductId && hasBackend)) { window.location.href = a.buyUrl; return; }   // a plain checkout link
    setBusy(true);
    const res = await startCheckout(a.slug);
    if (res && res.url) { window.location.href = res.url; return; }
    setBusy(false);
    setProblem(res && res.error ? res.error : "The checkout could not be opened. Check your connection and try again.");
  }

  return (
    <div className="page">
      <nav className="crumbs"><Link to="/?tab=paid">Paid animations</Link><i className="sq" aria-hidden="true" /><span>{a.title}</span></nav>

      <header className="page-head">
        <h1>{a.title}</h1>
        <p className="lead">{a.blurb}</p>
        <ul className="chips"><li><PixelIcon name="screen" size={14} /> {a.screen}</li></ul>

        <div className="actions">
          {forSale
            ? <button type="button" className="btn primary" onClick={buy} disabled={busy}><PixelIcon name="cart" size={14} /> {busy ? "Opening checkout..." : `Buy for ${a.price}`}</button>
            : <span className="btn primary" aria-disabled="true"><PixelIcon name="lock" size={14} /> Coming soon, {a.price}</span>}
          <HeartButton slug={a.slug} title={a.title} className="btn" />
        </div>
        {problem && <p className="note warn" role="alert">{problem}</p>}
        <p className="note">You pay on Polar's checkout page and come back here for the downloads. Your card details never reach this site.</p>
        <p className="licence"><b>Pay once, use it anywhere.</b> When you buy this animation you can use it in commercial products however you want.</p>
      </header>

      <section className="paid-preview px-box" aria-label={`${a.title} preview`}>
        <img src={folder + (a.preview || "thumb.png")} alt={`${a.title} on a 128 by 64 OLED`} width="512" height="256" />
      </section>

      {a.includes && a.includes.length > 0 && (
        <section className="guide">
          <h2>What you get</h2>
          <ul className="gets">
            {a.includes.map((line) => <li key={line}><PixelIcon name="check" size={14} /> {line}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
