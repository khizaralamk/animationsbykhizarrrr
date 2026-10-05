import { Link } from "react-router-dom";
import { folderOf, isPaid } from "../animations.js";

const dateText = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/* One card on the home page. The whole card is the link. Paid cards show their price in the corner. */
export default function AnimationCard({ animation, isNew, eager }) {
  const a = animation;
  return (
    <Link to={`/a/${a.slug}`} className="card-link">
      <article className="anim-card">
        <div className="thumb">
          {/* width and height tell the browser the picture's shape before it loads, so the card does not jump */}
          <img src={folderOf(a) + "thumb.png"} alt={`${a.title} on a 128 by 64 OLED`} width="512" height="256"
            loading={eager ? "eager" : "lazy"} decoding="async" />
          {isNew && <span className="badge">New</span>}
          {isPaid(a) && <span className="badge price">{a.price}</span>}
        </div>
        <div className="card-body">
          <h2>{a.title}</h2>
          <p className="note">{a.blurb}</p>
          <div className="meta">
            <span>Added {dateText(a.added)}</span>
            <span className="tags">{a.tags.map((t) => <em key={t}>{t}</em>)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
