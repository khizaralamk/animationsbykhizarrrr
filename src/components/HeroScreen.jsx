import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { folderOf } from "../animations.js";

/*
  THE LIVE OLED IN THE HERO
  -------------------------
  A real 128 x 64 canvas, the size of the screen these animations are made for, scaled up with
  sharp pixels. It shows each animation's picture in turn and glitches from one to the next,
  using the same glitch the Spidey Transitions sketch runs on a real board.

  The pictures are the cards' thumb.png files, read back into 1 bit (lit or dark) so the top 16
  rows can be drawn yellow and the rest cyan, like a two colour OLED module.
*/
const W = 128, H = 64, YELLOW_ROWS = 16;
const HOLD_MS = 2600, GLITCH_MS = 720, FRAME_MS = 42;
const YELLOW = [255, 204, 0], CYAN = [63, 216, 255];

/* Load a thumbnail and turn it into 128 x 64 on/off pixels. */
function loadBits(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.imageSmoothingEnabled = false;
      x.drawImage(img, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H).data, bits = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) bits[i] = d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2] > 150 ? 1 : 0;
      resolve(bits);
    };
    img.onerror = () => resolve(new Uint8Array(W * H));
    img.src = src;
  });
}

/* Mix picture A (old) and B (new) into out as u goes 0 to 1: tearing rows, fighting bands, noise blocks. */
function glitch(A, B, u, ms, out) {
  const src = u < 0.35 ? A : u > 0.65 ? B : null;
  const heat = u < 0.35 ? u / 0.35 : u > 0.65 ? (1 - u) / 0.35 : 1;
  for (let y = 0; y < H; y++) {
    const band = (y >> 2) + (Math.random() * 3 | 0);
    const from = src || ((band + (ms / 42 | 0)) & 1 ? B : A);
    const tear = Math.random() < 0.18 * heat ? Math.round((Math.random() - 0.5) * 30 * heat) : 0;
    const invert = !src && Math.random() < 0.06;
    for (let x = 0; x < W; x++) { let v = from[y * W + ((x - tear + W) % W)]; if (invert) v ^= 1; out[y * W + x] = v; }
  }
  const blocks = Math.round(6 * heat);
  for (let k = 0; k < blocks; k++) {
    const bx = Math.random() * W | 0, by = Math.random() * H | 0, bw = 3 + Math.random() * 14 | 0, bh = 1 + Math.random() * 3 | 0;
    for (let y = by; y < Math.min(H, by + bh); y++) for (let x = bx; x < Math.min(W, bx + bw); x++) out[y * W + x] = Math.random() < 0.5 ? 1 : 0;
  }
  if (heat > 0.5) { const ry = (ms / 12 | 0) % H; for (let x = 0; x < W; x++) if ((x + ry) % 3) out[ry * W + x] ^= 1; }
}

function paint(canvas, buf) {
  const ctx = canvas.getContext("2d"), img = ctx.createImageData(W, H), d = img.data;
  for (let i = 0; i < W * H; i++) {
    const col = ((i / W) | 0) < YELLOW_ROWS ? YELLOW : CYAN, o = i * 4;
    d[o] = buf[i] ? col[0] : 0; d[o + 1] = buf[i] ? col[1] : 0; d[o + 2] = buf[i] ? col[2] : 0; d[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

export default function HeroScreen({ animations }) {
  const canvasRef = useRef(null);
  const [index, setIndex] = useState(0);
  const jumpTo = useRef(null);                              // set by the dots to ask for a picture

  useEffect(() => {
    let alive = true, timer = null;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    Promise.all(animations.map((a) => loadBits(folderOf(a) + "thumb.png"))).then((pics) => {
      if (!alive || !canvasRef.current || pics.length === 0) return;
      const out = new Uint8Array(W * H);
      let cur = 0, next = 0, stage = "hold", since = performance.now();
      paint(canvasRef.current, pics[0]);

      timer = setInterval(() => {
        if (!canvasRef.current || document.hidden) return;
        const now = performance.now(), elapsed = now - since;
        if (stage === "hold") {
          const asked = jumpTo.current; jumpTo.current = null;
          const due = !still && pics.length > 1 && elapsed >= HOLD_MS;
          if (asked === null && !due) return;
          next = asked !== null ? asked : (cur + 1) % pics.length;
          if (next === cur) return;
          if (still) { cur = next; setIndex(cur); paint(canvasRef.current, pics[cur]); since = now; return; }
          stage = "glitch"; since = now;
          return;
        }
        const u = elapsed / GLITCH_MS;
        if (u >= 1) { cur = next; stage = "hold"; since = now; setIndex(cur); paint(canvasRef.current, pics[cur]); return; }
        glitch(pics[cur], pics[next], u, elapsed, out);
        paint(canvasRef.current, out);
      }, FRAME_MS);
    });
    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [animations]);

  const showing = animations[index];
  return (
    <div className="hero-screen">
      <div className="module">
        <div className="pins" aria-hidden="true"><span>GND</span><span>VCC</span><span>SCL</span><span>SDA</span></div>
        <canvas ref={canvasRef} width={W} height={H} aria-label={showing ? `${showing.title} playing on a simulated OLED` : "Simulated OLED"} />
        <div className="module-foot">
          {showing && <Link to={`/a/${showing.slug}`} className="now">{showing.title}</Link>}
          <div className="dots" role="group" aria-label="Pick an animation">
            {animations.map((a, i) => (
              <button key={a.slug} className="dot" aria-label={a.title} aria-pressed={i === index} onClick={() => { jumpTo.current = i; }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
