/*
  TALKING TO THE BACKEND
  ----------------------
  The backend is a separate project (the oled-backend repository). Its address comes from the
  VITE_API_URL setting: on Vercel, add it to this site's Environment Variables; on your own PC it
  is in .env.development. It is only an address, not a secret. No key ever lives in this site.

  If VITE_API_URL is missing, or the backend cannot be reached, every function here quietly gives
  up and the site keeps working: counts are hidden and hearts are remembered in this browser only.
*/
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const hasBackend = Boolean(BASE);

/* A random id for this browser. The backend only ever stores a scrambled version of it. */
export function visitorId() {
  const KEY = "abk-visitor";
  try {
    let id = localStorage.getItem(KEY);
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // storage is blocked: use an id that lasts for this page view only
    return (visitorId.temp = visitorId.temp || crypto.randomUUID());
  }
}

async function call(path, { method = "GET", body, keepalive = false } = {}) {
  if (!hasBackend) return null;
  try {
    const res = await fetch(BASE + path, {
      method,
      keepalive,                                               // lets a "download" event finish even if the page moves on
      headers: { "x-visitor-id": visitorId(), ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: (data && data.error) || "The request failed.", status: res.status };
    return data;
  } catch {
    return null;                                               // offline, blocked, or the backend is down
  }
}

/* { stats: { slug: { views, downloads, copies, hearts } }, totals } or null */
export const getStats = () => call("/api/stats");

/* Records a view, download or copy. Never throws and never blocks the page. */
export function track(slug, kind) {
  return call("/api/track", { method: "POST", keepalive: true, body: { slug, kind, referrer: document.referrer || "" } });
}

/* The slugs this visitor has hearted, or null when the backend is not available. */
export async function getHearts() {
  const data = await call("/api/heart");
  return data && Array.isArray(data.hearted) ? data.hearted : null;
}

/* Adds or removes a heart. Returns { hearted, hearts } or null. */
export const setHeart = (slug, on) => call("/api/heart", { method: "POST", body: { slug, on } });

/* Starts a purchase. Returns { transactionId } for Paddle's checkout to open, or { error }. */
export const startCheckout = (slug) => call("/api/checkout", { method: "POST", body: { slug } });

/* After paying: { status: "paid" | "pending" | "refunded", files? } */
export const getPurchase = (checkoutId) => call("/api/purchase?checkout_id=" + encodeURIComponent(checkoutId));
