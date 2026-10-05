import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPurchase, hasBackend } from "../api.js";
import { bySlug } from "../animations.js";
import { rememberPurchase } from "../paddle.js";
import { SUPPORT_EMAIL } from "../site.js";
import { useSite } from "../store.jsx";
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
const ASK_EVERY_MS = 1500, GIVE_UP_AFTER = 40;

/*
  Starting a download without a click. The link is opened in a hidden frame: the storage service
  answers with "this is a file to save", so the browser saves it and the page stays where it is.
  It works the same in Chrome, Edge, Firefox and Safari, on Windows, Mac and Linux.
  A browser may still refuse a download the visitor did not click for, which is why the button stays.
*/
function startDownload(url) {
  const frame = document.createElement("iframe");
  frame.style.display = "none";
  frame.src = url;
  document.body.appendChild(frame);
  setTimeout(() => frame.remove(), 60000);
}
/* The automatic download happens once per purchase per browser, not on every refresh. */
const AUTO_KEY = "abk-auto-downloaded";
function autoList() { try { const v = JSON.parse(localStorage.getItem(AUTO_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } }
const alreadyAutoDownloaded = (id) => autoList().includes(id);
function markAutoDownloaded(id) { try { localStorage.setItem(AUTO_KEY, JSON.stringify([...autoList(), id].slice(-50))); } catch { /* fine */ } }

export default function Thanks() {
  const [params] = useSearchParams();
  const checkoutId = params.get("checkout_id") || "";
  const [state, setState] = useState({ status: checkoutId && hasBackend ? "checking" : "missing" });
  const [copied, setCopied] = useState(false);
  const { record } = useSite();
  const [autoStarted, setAutoStarted] = useState(false);  // true when this visit kicked off the zip download by itself

  useEffect(() => {
    document.title = "Your downloads | OLED Animations";
    if (!checkoutId || !hasBackend) return;
    let alive = true, tries = 0, offline = 0, timer = null;

    async function ask() {
      const res = await getPurchase(checkoutId);
      if (!alive) return;
      tries++;
      // No answer at all means the server could not be reached. That says nothing about the payment,
      // so the page says so after a few quick tries instead of waiting a minute and blaming the payment.
      if (!res) {
        offline++;
        if (offline >= 3) { setState({ status: "unreachable" }); return; }
        timer = setTimeout(ask, 1000);
        return;
      }
      offline = 0;
      if (res && res.status === "paid") {
        rememberPurchase(res.slug, checkoutId);
        setState(res);
        // The first time this browser sees the payment confirmed, the zip starts downloading by itself,
        // so the buyer has a copy on their computer even if they close everything right away.
        if (res.zip && !alreadyAutoDownloaded(checkoutId)) { startDownload(res.zip.url); markAutoDownloaded(checkoutId); setAutoStarted(true); record(res.slug, "download"); }
        return;
      }
      if (res && res.status === "refunded") { setState(res); return; }
      if (res && res.error) { setState({ status: "problem", message: res.error }); return; }
      if (tries >= GIVE_UP_AFTER) { setState({ status: "slow" }); return; }
      timer = setTimeout(ask, ASK_EVERY_MS);
    }
    ask();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [checkoutId, record]);

  // A click on any download button counts as a download of this animation (once per visit).
  const countDownload = () => { if (state.slug) record(state.slug, "download"); };
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
          <p className="lead">{animation ? `${animation.title} is yours.` : "Your purchase is confirmed."} {state.zip ? "Everything is in one zip file." : "Download your files below."}</p>
          {state.zip ? (
            <>
              <div className="actions">
                <a className="btn primary" href={state.zip.url} onClick={countDownload}><PixelIcon name="download" size={14} /> Download everything (.zip)</a>
              </div>
              <p className="note" aria-live="polite">
                {autoStarted
                  ? `Your download has started: ${state.zip.name}. Look in your Downloads folder. If nothing happened, your browser blocked it; press the button above.`
                  : `The file is called ${state.zip.name}. It opens on Windows, Mac and Linux with a double click.`}
              </p>
              {state.files && state.files.length > 0 && (
                <details className="singles">
                  <summary>Or download one file at a time</summary>
                  <div className="actions">
                    {state.files.map((f) => <a key={f.name} className="btn small" href={f.url} onClick={countDownload}><PixelIcon name="download" size={13} /> {f.name}</a>)}
                  </div>
                </details>
              )}
            </>
          ) : state.files && state.files.length > 0 ? (
            <div className="actions">
              {state.files.map((f) => <a key={f.name} className="btn primary" href={f.url} onClick={countDownload}><PixelIcon name="download" size={14} /> {f.name}</a>)}
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

        {state.status === "unreachable" && (<>
          <h1>Cannot reach the server</h1>
          <p className="lead">This is a connection problem, not a payment problem. If you paid, your purchase is safe and you will not be charged twice. Try again in a moment.</p>
          <div className="actions"><button className="btn primary" onClick={() => window.location.reload()}>Try again</button></div>
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
