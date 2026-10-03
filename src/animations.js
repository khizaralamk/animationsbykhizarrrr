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
*/
export const ANIMATIONS = [
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
export const newestFirst = () => [...ANIMATIONS].sort((a, b) => (a.added < b.added ? 1 : -1));
export const folderOf = (a) => `/animations/${a.slug}/`;
