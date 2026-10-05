import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { newestFirst, isPaid } from "../animations.js";
import AnimationCard from "../components/AnimationCard.jsx";

const TABS = [
  { key: "free", label: "Free" },
  { key: "paid", label: "Paid" },
];

/*
  The home page: one line of help, then two tabs (Free and Paid), then the cards for the open tab,
  newest first. The open tab lives in the address (?tab=paid), so it can be linked and survives a refresh.
*/
export default function Home() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "paid" ? "paid" : "free";

  const all = newestFirst();
  const lists = { free: all.filter((a) => !isPaid(a)), paid: all.filter(isPaid) };
  const list = lists[tab];

  useEffect(() => { document.title = "OLED Animations"; }, []);

  return (
    <>
      <header className="hero compact">
        <h1>Recently added</h1>
        <p className="lead">Try each one in your browser, then download the file. If it comes with a sketch, upload that to your board. Want one with your own pictures? <Link to="/make-your-own">Make your own</Link>.</p>
      </header>

      <section aria-label="Animations">
        <div className="tabs" role="tablist" aria-label="Free or paid">
          {TABS.map((t) => (
            <button key={t.key} role="tab" id={"tab-" + t.key} aria-selected={tab === t.key} aria-controls="tab-panel"
              className="tab" onClick={() => setParams(t.key === "free" ? {} : { tab: t.key }, { replace: true })}>
              {t.label} <span className="count">{lists[t.key].length}</span>
            </button>
          ))}
        </div>

        <div id="tab-panel" role="tabpanel" aria-labelledby={"tab-" + tab}>
          {list.length > 0 ? (
            <div className="grid">
              {/* the first two cards are on screen straight away, so their pictures load first */}
              {list.map((a, i) => <AnimationCard key={a.slug} animation={a} isNew={tab === "free" && i === 0} eager={i < 2} />)}
            </div>
          ) : (
            <div className="empty">
              <h2>Nothing here yet</h2>
              <p className="note">Paid animations will show up here when they are ready. Everything under Free is yours to download today.</p>
              <button onClick={() => setParams({}, { replace: true })}>See the free ones</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
