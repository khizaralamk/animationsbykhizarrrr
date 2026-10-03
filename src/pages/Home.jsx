import { newestFirst } from "../animations.js";
import AnimationCard from "../components/AnimationCard.jsx";

/* The home page: a short hero, then every animation as a card, newest first. */
export default function Home() {
  const list = newestFirst();
  return (
    <>
      <header className="hero">
        <p className="kicker">128 by 64 OLED, ESP32 or Arduino</p>
        <h1>OLED animations</h1>
        <p className="lead">Try each one in your browser, then download the file. If it comes with a sketch, upload that to your board.</p>
      </header>

      <section aria-labelledby="recent">
        <div className="section-head">
          <h2 id="recent">Recently added</h2>
          <span className="note">{list.length} animation{list.length === 1 ? "" : "s"}</span>
        </div>
        <div className="grid">
          {list.map((a, i) => <AnimationCard key={a.slug} animation={a} isNew={i === 0} />)}
        </div>
      </section>
    </>
  );
}
