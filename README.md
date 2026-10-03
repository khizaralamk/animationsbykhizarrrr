# Animations by Khizar

A small React + Vite site that shows pixel animations for 128 by 64 OLED screens.
The home page lists every animation as a card, newest first. Each animation has its own page with a live preview, downloads, and a set up guide where there is one.

## Run it

```
npm install
npm run dev
```

Then open http://localhost:5173

`npm run build` makes a `dist/` folder you can put on any static host.

## How it is put together

| Where | What |
| --- | --- |
| `src/animations.js` | The list of animations. Add an entry here to add a card. |
| `src/pages/Home.jsx` | The home page with the cards. |
| `src/pages/AnimationPage.jsx` | One animation: the live preview in a frame, downloads, guide. |
| `src/components/` | The page frame (top bar, footer, White / Black switch) and the card. |
| `src/styles.css` | All the styling, in numbered sections. |
| `public/animations/<slug>/` | The animation itself: `index.html` (one complete file, also the download), `thumb.png` for the card, and optional `guide.md` and sketch files. |

Each animation is a complete, stand-alone HTML file. The site shows it in a frame and offers the same file as a download, so what visitors download is exactly what they saw.

## Add an animation

1. Make a folder `public/animations/my-animation/`.
2. Put the animation in it as `index.html`, and a `thumb.png` (a picture of the screen, 2:1).
3. Add `guide.md` and any sketch files if you have them.
4. Add an entry to `src/animations.js`. Save. The card appears.
