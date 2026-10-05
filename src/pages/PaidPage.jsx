import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { folderOf } from "../animations.js";
import { startCheckout, hasBackend } from "../api.js";
import { openCheckout, hasPaddle, ownedCheckoutId } from "../paddle.js";
import PixelIcon from "../components/PixelIcon.jsx";
import HeartButton from "../components/HeartButton.jsx";

/*
  The page for a paid animation: what the buyer gets and one Buy button.

  Pressing Buy asks the backend to create a transaction at Paddle (the payment service), then opens
  Paddle's checkout on top of this page. Card details go straight to Paddle. After paying, the buyer
  lands on /thanks, which shows the download links. That address keeps working, so they can come
  back for their files without paying again.

  The animation's own files are NOT on this site: anything in public/ can be downloaded by anyone.
  They live in a private storage bucket and are only handed out after payment.
  Only the card picture and a preview loop live here.
*/
export default function PaidPage({ animation }) {
  const a = animation;
  const folder = folderOf(a);
  const { theme } = useOutletContext();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const owned = ownedCheckoutId(a.slug);                    // set when this browser has bought it before
  const forSale = Boolean(a.paddlePriceId && hasBackend && hasPaddle);

  useEffect(() => { document.title = `${a.title} | OLED Animations`; }, [a]);

  async function buy() {
    setProblem(""); setBusy(true);
    try {
      const res = await startCheckout(a.slug);
      if (!res || !res.transactionId) throw new Error(res && res.error ? res.error : "The checkout could not be started. Check your connection and try again.");
      await openCheckout({
        transactionId: res.transactionId,
        successUrl: `${window.location.origin}/thanks?checkout_id=${encodeURIComponent(res.transactionId)}`,
        theme: theme === "dark" ? "dark" : "light",
        onClose: () => setBusy(false),
      });
    } catch (err) {
      setBusy(false);
      setProblem(err.message || "The checkout could not be opened.");
    }
  }

  return (
    <div className="page">
      <nav className="crumbs"><Link to="/?tab=paid">Paid animations</Link><i className="sq" aria-hidden="true" /><span>{a.title}</span></nav>

      <header className="page-head">
        <h1>{a.title}</h1>
        <p className="lead">{a.blurb}</p>
        <ul className="chips"><li><PixelIcon name="screen" size={14} /> {a.screen}</li></ul>

        <div className="actions">
          {owned
            ? <Link className="btn primary" to={`/thanks?checkout_id=${encodeURIComponent(owned)}`}><PixelIcon name="download" size={14} /> You own this. Get your files</Link>
            : forSale
              ? <button type="button" className="btn primary" onClick={buy} disabled={busy}><PixelIcon name="cart" size={14} /> {busy ? "Opening checkout..." : `Buy for ${a.price}`}</button>
              : <span className="btn primary" aria-disabled="true"><PixelIcon name="lock" size={14} /> Coming soon, {a.price}</span>}
          <HeartButton slug={a.slug} title={a.title} className="btn" />
        </div>
        {problem && <p className="note warn" role="alert">{problem}</p>}
        <p className="note">You pay once, in Paddle's secure checkout. Your card details never reach this site. Straight after paying you get your download page, and you can come back to it any time without paying again. See <Link to="/refunds">refunds</Link> and <Link to="/terms">terms</Link>.</p>
        <p className="licence"><b>Pay once, use it anywhere.</b> When you buy this animation you can use it in commercial products however you want.</p>
      </header>

      <section className="paid-preview px-box" aria-label={`${a.title} preview`}>
        <img src={folder + (a.preview || "thumb.png")} alt={`${a.title} on a 128 by 64 OLED`} width="768" height="384" />
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
