import { Link } from "react-router-dom";
import { newestFirst } from "../animations.js";
import AnimationCard from "../components/AnimationCard.jsx";

/* The home page: one line of help, then every animation as a card, newest first. */
export default function Home() {
  const list = newestFirst();
  return (
    <>
      <header className="hero compact">
        <h1>Recently added</h1>
        <p className="lead">Try each one in your browser, then download the file. If it comes with a sketch, upload that to your board. Want one with your own pictures? <Link to="/make-your-own">Make your own</Link>.</p>
      </header>

      <section aria-label="Animations">
        <div className="grid">
          {list.map((a, i) => <AnimationCard key={a.slug} animation={a} isNew={i === 0} />)}
        </div>
      </section>
    </>
  );
}
