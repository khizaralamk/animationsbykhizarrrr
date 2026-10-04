<div align="center">

<img src="public/favicon.svg" width="72" alt="">

# OLED Animations

**Animations for 128 by 64 OLED screens. Preview in the browser, download one file, upload a sketch to your ESP32.**

[![React](https://img.shields.io/badge/React-18-20232a?logo=react&logoColor=61dafb)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![ESP32](https://img.shields.io/badge/ESP32-Arduino%20IDE-e7352c?logo=arduino&logoColor=white)](https://www.arduino.cc)
[![Stars](https://img.shields.io/github/stars/KhizarAlam20/animationsbykhizarrrr?style=social)](https://github.com/KhizarAlam20/animationsbykhizarrrr/stargazers)

</div>

---

## The animations

| | Name | What it does | Comes with |
| :---: | --- | --- | --- |
| <img src="public/animations/nah-id-win-2/thumb.png" width="220" alt="Nah, I'd Win 2"> | **Nah, I'd Win 2** | The blindfolded head and the speech bubble with a sliding shine. Two layouts, Line or Fill. | Page, set up guide, ESP32 sketch |
| <img src="public/animations/nah-id-win/thumb.png" width="220" alt="Nah, I'd Win"> | **Nah, I'd Win** | The speech bubble with a sliding shine. Tall or wide, Line or Fill. | Page, set up guide, ESP32 sketch |
| <img src="public/animations/the-boogley/thumb.png" width="220" alt="The Boogley"> | **The Boogley** | A dancing character traced from a video, 151 frames at 10 a second. Four styles, any speed. | Page, set up guide, ESP32 sketch with all the frames inside |
| <img src="public/animations/spidey-transitions/thumb.png" width="220" alt="Spidey Transitions"> | **Spidey Transitions** | Three spider emblems traced into 1 bit pixels. Turn them, spin them, or run the glitch show. | Page, set up guide, ESP32 sketch with your settings filled in, and a [make your own](public/animations/spidey-transitions/make-your-own.md) guide with a starter sketch |
| <img src="public/animations/eye-lab/thumb.png" width="220" alt="Eye Lab"> | **Eye Lab** | A pair of pill shaped eyes that look around, blink and change emotion. | Page |

Every animation is **one HTML file**. It runs in your browser on a simulated 0.96 inch OLED at the board's own frame rate, so what you see is what the glass will show. Download it, keep it, open it offline.

---

## Run the site

```bash
npm install
npm run dev
```

Open http://localhost:5173

`npm run build` makes a `dist/` folder for any static host.

---

## How it is put together

```
animationsbykhizar/
├─ index.html                 the shell Vite fills
├─ src/
│  ├─ animations.js           THE LIST. One entry per animation.
│  ├─ pages/
│  │  ├─ Home.jsx             cards, newest first
│  │  ├─ AnimationPage.jsx    live preview, downloads, Copy HTML, guide
│  │  ├─ MakeYourOwn.jsx      the make your own guide, with the starter sketch
│  │  └─ NotFound.jsx
│  ├─ components/
│  │  ├─ Layout.jsx           top bar, White / Black switch, footer
│  │  └─ AnimationCard.jsx
│  └─ styles.css              all styling, in numbered sections
└─ public/animations/<slug>/
   ├─ index.html              the animation, complete and stand alone (also the download)
   ├─ thumb.png               picture for the card, 2:1
   ├─ guide.md                optional: how to put it on a board
   └─ *.ino                   optional: the Arduino sketch
```

The site shows each animation in a frame opened with `?embed=1`, so the file hides its own header, follows the site's White / Black choice, and reports its height. The same file is what visitors download, so the preview and the download never drift apart.

---

## Add an animation

1. Make a folder `public/animations/my-animation/`.
2. Put the animation in it as `index.html` and add a `thumb.png` (a picture of the screen, 2:1).
3. Add `guide.md` and any sketch files if you have them.
4. Add an entry to `src/animations.js`:

```js
{
  slug: "my-animation",
  title: "My Animation",
  blurb: "One or two sentences for the card.",
  added: "2026-10-03",
  tags: ["bounce", "ESP32 sketch"],
  screen: "128 x 64 OLED, I2C, 0.96 inch",
  files: [{ label: "Download the page", file: "index.html", note: "One HTML file." }],
  guides: [{ title: "How to put it on your board", file: "guide.md" }],
}
```

Save. The card appears at the top of the home page.

---

## Put one on your board

Each animation page has the steps, and Spidey Transitions ships a full guide: parts, wiring, Arduino IDE set up, the BOOT button trick, and what to do when the screen stays dark. Short version:

```
OLED GND  ->  ESP32 GND
OLED VCC  ->  ESP32 3V3
OLED SCL  ->  GPIO 26
OLED SDA  ->  GPIO 25
```

Press **Copy the complete sketch with my settings** on the animation, paste into an empty Arduino sketch, upload.

---

<div align="center">

If this helped you, **drop a star on the repo.** It helps more people find it.

</div>
