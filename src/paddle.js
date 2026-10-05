/*
  PADDLE CHECKOUT
  ---------------
  Paddle is the payment service. Its checkout opens on top of this site, in a frame that belongs
  to Paddle, so card details go straight to Paddle and never touch this site or its backend.

  Two settings, both public (they are meant to be seen by browsers):
    VITE_PADDLE_CLIENT_TOKEN   a "client-side token" from Paddle > Developer tools > Authentication
    VITE_PADDLE_ENV            "sandbox" while testing, "production" for real payments
  The secret API key and the webhook secret live only on the backend.

  Paddle's script is loaded the first time it is needed, not on every page view.
*/
const TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || "";
const ENV = import.meta.env.VITE_PADDLE_ENV === "sandbox" ? "sandbox" : "production";
export const hasPaddle = Boolean(TOKEN);

let ready = null;                                           // the one loading promise, shared by every caller
let onEvent = null;                                         // who wants to hear about checkout events right now

export function loadPaddle() {
  if (!hasPaddle) return Promise.reject(new Error("Payments are not set up on this site yet."));
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      try {
        if (ENV === "sandbox") window.Paddle.Environment.set("sandbox");
        window.Paddle.Initialize({ token: TOKEN, eventCallback: (event) => { if (onEvent) onEvent(event); } });
        resolve(window.Paddle);
      } catch (err) { reject(err); }
    };
    script.onerror = () => { ready = null; reject(new Error("Paddle's checkout could not be loaded. Check your connection, or switch off any blocker for this site.")); };
    document.head.appendChild(script);
  });
  return ready;
}

/*
  Opens the checkout for a transaction the backend created.
  When the payment goes through, the buyer is sent to successUrl. onClose is told if they shut the
  checkout without paying.
*/
export async function openCheckout({ transactionId, successUrl, theme = "light", onClose }) {
  const Paddle = await loadPaddle();
  onEvent = (event) => {
    if (event && event.name === "checkout.completed") window.location.href = successUrl;   // a second route to the thanks page
    if (event && event.name === "checkout.closed" && onClose) onClose();
  };
  Paddle.Checkout.open({ transactionId, settings: { displayMode: "overlay", theme, successUrl } });
}

/*
  REMEMBERING PURCHASES IN THIS BROWSER
  The buyer's way back to their files is the thanks page address. This browser also keeps a note of
  it per animation, so the animation's page can show "You own this" with a link straight to the files.
*/
const KEY = "abk-purchases";
function read() { try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); return v && typeof v === "object" ? v : {}; } catch { return {}; } }
export function rememberPurchase(slug, checkoutId) {
  if (!slug || !checkoutId) return;
  try { localStorage.setItem(KEY, JSON.stringify({ ...read(), [slug]: checkoutId })); } catch { /* storage blocked: the address still works */ }
}
export const ownedCheckoutId = (slug) => read()[slug] || null;
