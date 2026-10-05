/*
  THE LIST OF ANIMATIONS
  ----------------------
  Every animation on the site is one entry here. To add a new one:
    1. Put its folder under public/animations/<slug>/ with at least index.html and thumb.png.
    2. Add an entry below. "added" is a date (YYYY-MM-DD); the home page sorts newest first.
  Fields:
    slug      the address of its page: /a/<slug>, and its folder under public/animations/
    title     shown on the card and the page
    blurb     one or two sentences for the card
    added     date it was added, newest first on the home page
    tags      short words shown on the card
    screen    what the animation is for
    files     downloads shown on the page. Each is { label, file, note }. "file" is relative to the folder.
    guides    markdown files in the folder shown under the preview. Each is { title, file }. Can be empty.

  PAID ANIMATIONS (the Paid tab on the home page)
  Add  tier: "paid"  to an entry and it moves to the Paid tab. A paid entry uses these fields instead of
  files and guides:
    price     what the card and the Buy button show, for example "$5"
    paddlePriceId   the price's id in Paddle (it starts with pri_). With it, the Buy button opens Paddle's checkout
                    and the buyer gets their downloads on the /thanks page. Leave it out to show "Coming soon".
    includes  a list of short lines: what the buyer gets
    preview   optional: a short moving loop in the folder (preview.gif). The card plays it while it is on screen.
              Free animations can have one too. Without it the card shows thumb.png, which every animation needs.
  IMPORTANT: do not put a paid animation's index.html or sketch in public/. Everything in public/ can be
  downloaded by anyone who knows the address. Put only thumb.png (and a preview picture) there. Upload the
  real files to the private Supabase bucket "paid-animations", in a folder named after the slug. The backend
  hands out download links only after payment.
  Example:
    {
      slug: "my-paid-animation", tier: "paid", title: "My Paid Animation",
      blurb: "One or two sentences.", added: "2026-10-05", tags: ["exclusive"],
      screen: "128 x 64 OLED, I2C, 0.96 inch",
      price: "$5", paddlePriceId: fromEnv("VITE_PRICE_MY_PAID_ANIMATION"),
      includes: ["The animation page (one HTML file)", "The ESP32 sketch", "Set up guide"],
    },

  PRICE IDS ARE NOT WRITTEN IN THIS FILE
  A Paddle price id comes from an environment variable, named with fromEnv("VITE_PRICE_...").
  On your PC the values are in .env.development.local (sandbox ids, for test cards). On Vercel they are
  in the site's Environment Variables (live ids, for real money). If a variable is missing, the
  animation simply shows "Coming soon".
*/
const fromEnv = (name) => (import.meta.env ? import.meta.env[name] : typeof process !== "undefined" ? process.env[name] : "") || "";

export const ANIMATIONS = [
  {
    // PAID. Its real files are in the private bucket paid-animations/prison-realm/, not on this site.
    slug: "prison-realm",
    tier: "paid",
    title: "Prison Realm",
    blurb: "The Prison Realm cube with nine living eyes. Each eye blinks on its own beat and they all glance around together. Fill or Line style.",
    added: "2026-10-05",
    tags: ["blinking eyes", "exclusive", "ESP32 sketch"],
    screen: "128 x 64 OLED, I2C, 0.96 inch",
    price: "$6.99",              // what the card and the Buy button show. The real price is the one set in Paddle.
    paddlePriceId: fromEnv("VITE_PRICE_PRISON_REALM"),
    // Launch offer: the first <limit> buyers pay the cheaper price, then it goes back to the normal one by itself.
    // The backend counts the sales and picks the price. Delete this block to end the offer early.
    launch: { price: "$1", paddlePriceId: fromEnv("VITE_PRICE_PRISON_REALM_LAUNCH"), limit: 10 },
    preview: "preview.gif",      // a short loop of the animation, shown on its page
    includes: [
      "The preview page: one HTML file with Fill and Line styles, blink and glance controls, and an Arduino bitmap copy box",
      "The complete ESP32 sketch in one file, with the cube and all nine eyes inside",
      "A step by step guide: wiring, Arduino IDE set up, every setting, upload and troubleshooting",
      "One zip with everything, named prison-realm-oled-animation.zip, that downloads by itself after payment",
      "Commercial use: pay once, use it in your products however you want",
    ],
  },
  {
    slug: "nah-id-win-2",
    preview: "preview.gif",
    title: "Nah, I'd Win 2",
    blurb: "The blindfolded head with the speech bubble beside it, traced for the full screen, with a shine that slides across every few seconds. Two layouts, Line or Fill.",
    added: "2026-10-05",
    tags: ["shine", "line or fill", "ESP32 sketch"],
    screen: "128 x 64 OLED, I2C, 0.96 inch",
    files: [
      { label: "Download the page", file: "index.html", note: "One HTML file. Works offline." },
      { label: "Download the sketch", file: "NahIdWin2_OneFile.ino", note: "Arduino sketch, pictures inside. Put it in a folder named NahIdWin2_OneFile." },
    ],
    guides: [
      { title: "How to put it on your board", file: "guide.md" },
    ],
  },
  {
    slug: "nah-id-win",
    preview: "preview.gif",
    title: "Nah, I'd Win",
    blurb: "The speech bubble on its own, traced pixel by pixel, with a shine that slides across every few seconds. Tall or wide, Line or Fill.",
    added: "2026-10-05",
    tags: ["shine", "portrait", "ESP32 sketch"],
    screen: "128 x 64 OLED, I2C, 0.96 inch",
    files: [
      { label: "Download the page", file: "index.html", note: "One HTML file. Works offline." },
      { label: "Download the sketch", file: "NahIdWin_OneFile.ino", note: "Arduino sketch, pictures inside. Put it in a folder named NahIdWin_OneFile." },
    ],
    guides: [
      { title: "How to put it on your board", file: "guide.md" },
    ],
  },
  {
    slug: "the-boogley",
    preview: "preview.gif",
    title: "The Boogley",
    blurb: "A dancing character traced from a 15 second video, 151 frames, one every tenth of a second. Pick a style and a speed, then copy the ESP32 sketch with the frames already inside.",
    added: "2026-10-04",
    tags: ["dance", "151 frames", "ESP32 sketch"],
    screen: "128 x 64 OLED, I2C, 0.96 inch",
    files: [
      { label: "Download the page", file: "index.html", note: "One HTML file. Works offline." },
      { label: "Download the sketch", file: "BoogleyDance_OneFile.ino", note: "Arduino sketch, all 151 frames in one file. Filled style." },
    ],
    guides: [
      { title: "How to put it on your board", file: "guide.md" },
    ],
  },
  {
    slug: "spidey-transitions",
    preview: "preview.gif",
    title: "Spidey Transitions",
    blurb: "Three spider emblems traced into 1 bit pixels. Turn them, spin them, or run the glitch show, then copy the ESP32 sketch with your settings already filled in.",
    added: "2026-10-03",
    tags: ["glitch", "rotation", "ESP32 sketch"],
    screen: "128 x 64 OLED, I2C, 0.96 inch",
    files: [
      { label: "Download the page", file: "index.html", note: "One HTML file. Works offline." },
      { label: "Download the sketch", file: "SpiderShow_OneFile.ino", note: "Arduino sketch, everything in one file." },
      { label: "Starter sketch", file: "MakeYourOwn/MakeYourOwn.ino", note: "A short glitch slideshow sketch for your own pictures." },
      { label: "Starter pictures.h", file: "MakeYourOwn/pictures.h", note: "Goes next to the starter sketch. Replace the pictures with yours." },
    ],
    guides: [
      { title: "How to put it on your board", file: "guide.md" },
    ],
  },
  {
    slug: "eye-lab",
    preview: "preview.gif",
    title: "Eye Lab",
    blurb: "A pair of pill shaped eyes that look around, blink and change emotion. Pixel exact at the board's own frame rate.",
    added: "2026-09-24",
    tags: ["eyes", "emotions", "blink"],
    screen: "128 x 64 OLED, I2C, 0.96 inch",
    files: [
      { label: "Download the page", file: "index.html", note: "One HTML file. Works offline." },
    ],
    guides: [],
  },
];

export const bySlug = (slug) => ANIMATIONS.find((a) => a.slug === slug);
// Newest first. Entries added on the same day keep the order they have in the list above.
export const newestFirst = () => [...ANIMATIONS].sort((a, b) => b.added.localeCompare(a.added));
export const isPaid = (a) => a.tier === "paid";

/*
  What a paid animation costs right now.
  "offer" is what the backend says about its launch offer: { limit, left }, or nothing if it has none
  or the backend has not answered yet. While places are left, the cheaper price shows with the
  normal one crossed out. Otherwise it is just the normal price.
*/
const amount = (text) => parseFloat(String(text).replace(/[^0-9.]/g, ""));
export function priceNow(a, offer) {
  if (!a.launch || !offer || !(offer.left > 0)) return { price: a.price, discount: null };
  const percent = Math.round((1 - amount(a.launch.price) / amount(a.price)) * 100);
  return { price: a.launch.price, discount: { was: a.price, percent, limit: offer.limit, left: offer.left } };
}
export const folderOf = (a) => `/animations/${a.slug}/`;
