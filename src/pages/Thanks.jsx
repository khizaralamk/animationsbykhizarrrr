import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPurchase, hasBackend } from "../api.js";
import { bySlug } from "../animations.js";
import PixelIcon from "../components/PixelIcon.jsx";

/*
  Where Polar sends the buyer after paying:  /thanks?checkout_id=...
  The page asks the backend whether that checkout has been paid. Polar tells the backend a moment
  after the payment, so the page asks again every few seconds for about a minute.
  When it is paid, the backend returns download links that work for 10 minutes.
*/
const ASK_EVERY_MS = 2500, GIVE_UP_AFTER = 24;

export default function Thanks() {
  const [params] = useSearchParams();
  const checkoutId = params.get("checkout_id") || "";
  const [state, setState] = useState({ status: checkoutId && hasBackend ? "checking" : "missing" });

  useEffect(() => {
    document.title = "Thank you | OLED Animations";
    if (!checkoutId || !hasBackend) return;
    let alive = true, tries = 0, timer = null;

    async function ask() {
      const res = await getPurchase(checkoutId);
      if (!alive) return;
      tries++;
      if (res && res.status === "paid") { setState(res); return; }
      if (res && res.status === "refunded") { setState(res); return; }
      if (res && res.error && res.status !== 404) { setState({ status: "problem", message: res.error }); return; }
      if (tries >= GIVE_UP_AFTER) { setState({ status: "slow" }); return; }
      timer = setTimeout(ask, ASK_EVERY_MS);
    }
    ask();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [checkoutId]);

  const animation = state.slug ? bySlug(state.slug) : null;

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
            <>
              <div className="actions">
                {state.files.map((f) => <a key={f.name} className="btn primary" href={f.url}><PixelIcon name="download" size={14} /> {f.name}</a>)}
              </div>
              <p className="note">These links work for 10 minutes. Reload this page to get fresh ones. Keep the address of this page: it is your way back to the files.</p>
            </>
          ) : (
            <p className="note warn">Your payment went through, but the files are not uploaded yet. Reload this page in a few minutes.</p>
          )}
          <p className="licence"><b>Pay once, use it anywhere.</b> You can use what you bought in commercial products however you want.</p>
        </>)}

        {state.status === "refunded" && (<>
          <h1>This order was refunded</h1>
          <p className="lead">The downloads for it are closed.</p>
        </>)}

        {state.status === "slow" && (<>
          <h1>Still waiting for the payment</h1>
          <p className="lead">The payment has not been confirmed yet. If you paid, reload this page in a minute. Nothing is lost: this address stays valid.</p>
          <div className="actions"><button className="btn primary" onClick={() => window.location.reload()}>Check again</button></div>
        </>)}

        {state.status === "problem" && (<>
          <h1>Could not check the order</h1>
          <p className="lead">{state.message} Reload the page to try again.</p>
        </>)}

        {state.status === "missing" && (<>
          <h1>No order to show</h1>
          <p className="lead">This page shows your downloads after a purchase. Open it from the link you were sent to after paying.</p>
        </>)}

        <div className="actions"><Link className="btn" to="/">Back to the animations</Link></div>
      </header>
    </div>
  );
}
