import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPurchase, hasBackend } from "../api.js";
import { bySlug } from "../animations.js";
import { rememberPurchase } from "../paddle.js";
import { SUPPORT_EMAIL } from "../site.js";
import PixelIcon from "../components/PixelIcon.jsx";

/*
  The buyer's download page:  /thanks?checkout_id=txn_...
  They land here straight after paying. The page asks the backend whether that payment has been
  confirmed. Paddle tells the backend a moment after the payment, so the page asks again every few
  seconds for about a minute. When it is confirmed, the backend returns download links.

  This address is the buyer's way back to their files: opening it again, today or next year, gives
  fresh links without paying again. The browser also remembers it, so the animation's own page shows
  "You own this".
*/
const ASK_EVERY_MS = 2500, GIVE_UP_AFTER = 24;

export default function Thanks() {
  const [params] = useSearchParams();
  const checkoutId = params.get("checkout_id") || "";
  const [state, setState] = useState({ status: checkoutId && hasBackend ? "checking" : "missing" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Your downloads | OLED Animations";
    if (!checkoutId || !hasBackend) return;
    let alive = true, tries = 0, timer = null;

    async function ask() {
      const res = await getPurchase(checkoutId);
      if (!alive) return;
      tries++;
      if (res && res.status === "paid") { rememberPurchase(res.slug, checkoutId); setState(res); return; }
      if (res && res.status === "refunded") { setState(res); return; }
      if (res && res.error) { setState({ status: "problem", message: res.error }); return; }
      if (tries >= GIVE_UP_AFTER) { setState({ status: "slow" }); return; }
      timer = setTimeout(ask, ASK_EVERY_MS);
    }
    ask();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [checkoutId]);

  const animation = state.slug ? bySlug(state.slug) : null;
  const copyLink = () => navigator.clipboard.writeText(window.location.href).then(() => setCopied(true), () => setCopied(false));

  return (
    <div className="page">
      <header className="page-head">
        {state.status === "checking" && (<>
          <h1>Confirming your payment</h1>
          <p className="lead">This takes a few seconds. Keep this page open.</p>
          <p className="blink" aria-hidden="true"><i className="sq" /><i className="sq" /><i className="sq" /></p>
        </>)}

        {state.status === "paid" && (<>
          <h1>Thank you</h1>
          <p className="lead">{animation ? `${animation.title} is yours.` : "Your purchase is confirmed."} Download your files below.</p>
          {state.files && state.files.length > 0 ? (
            <div className="actions">
              {state.files.map((f) => <a key={f.name} className="btn primary" href={f.url}><PixelIcon name="download" size={14} /> {f.name}</a>)}
            </div>
          ) : (
            <p className="note warn">Your payment went through, but the files are not uploaded yet. Reload this page in a few minutes, or write to {SUPPORT_EMAIL}.</p>
          )}

          <div className="keep px-box">
            <h2>Keep this page</h2>
            <p>This address is your way back to your files. You never have to pay again for something you bought: open this page whenever you need the files and it gives you fresh download links. The buttons above stop working after 10 minutes, so reload the page to get new ones.</p>
            <div className="actions">
              <button type="button" className="btn" onClick={copyLink}><PixelIcon name="copy" size={14} /> {copied ? "Address copied" : "Copy this page's address"}</button>
            </div>
            <p className="note">Bookmark it or save it somewhere safe. This browser also remembers it, so the animation's page will show "You own this". If you ever lose the address, write to {SUPPORT_EMAIL} from the email you paid with, or include your Paddle receipt, and you will get it back.</p>
          </div>
          <p className="licence"><b>Pay once, use it anywhere.</b> You can use what you bought in commercial products however you want.</p>
        </>)}

        {state.status === "refunded" && (<>
          <h1>This order was refunded</h1>
          <p className="lead">The downloads for it are closed. If you think this is a mistake, write to {SUPPORT_EMAIL}.</p>
        </>)}

        {state.status === "slow" && (<>
          <h1>Still waiting for the payment</h1>
          <p className="lead">The payment has not been confirmed yet. If you paid, nothing is lost and you will not be charged twice: this address stays valid. Reload the page in a minute.</p>
          <div className="actions"><button className="btn primary" onClick={() => window.location.reload()}>Check again</button></div>
          <p className="note">Still stuck after a few minutes? Write to {SUPPORT_EMAIL} with your Paddle receipt.</p>
        </>)}

        {state.status === "problem" && (<>
          <h1>Could not check the order</h1>
          <p className="lead">{state.message} Reload the page to try again, or write to {SUPPORT_EMAIL}.</p>
        </>)}

        {state.status === "missing" && (<>
          <h1>No order to show</h1>
          <p className="lead">This page shows your downloads after a purchase. Open it from the address you landed on after paying. Lost it? Write to {SUPPORT_EMAIL} from the email you paid with.</p>
        </>)}

        <div className="actions"><Link className="btn" to="/">Back to the animations</Link><Link className="btn" to="/support">Support</Link></div>
      </header>
    </div>
  );
}
