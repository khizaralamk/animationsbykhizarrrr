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
    polarProductId  the product's id in Polar. With it, the Buy button opens Polar's checkout through the backend
                    and the buyer gets their downloads on the /thanks page. This is the normal way to sell.
    buyUrl    instead of polarProductId: a plain checkout link to any other service. Leave both out to show "Coming soon".
    includes  a list of short lines: what the buyer gets
    preview   optional: a bigger picture in the folder to show on the page (thumb.png is used otherwise)
  IMPORTANT: do not put a paid animation's index.html or sketch in public/. Everything in public/ can be
  downloaded by anyone who knows the address. Put only thumb.png (and a preview picture) there. Upload the
  real files to the private Supabase bucket "paid-animations", in a folder named after the slug. The backend
  hands out download links only after payment.
  Example:
    {
      slug: "my-paid-animation", tier: "paid", title: "My Paid Animation",
      blurb: "One or two sentences.", added: "2026-10-05", tags: ["exclusive"],
      screen: "128 x 64 OLED, I2C, 0.96 inch",
      price: "$5", polarProductId: "<the product id from Polar>",
      includes: ["The animation page (one HTML file)", "The ESP32 sketch", "Set up guide"],
    },
*/
export const ANIMATIONS = [
  {
    slug: "nah-id-win-2",
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
export const folderOf = (a) => `/animations/${a.slug}/`;
