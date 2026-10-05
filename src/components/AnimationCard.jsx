import { Link } from "react-router-dom";
import { folderOf, isPaid, priceNow } from "../animations.js";
import { useSite, compact } from "../store.jsx";
import PixelIcon from "./PixelIcon.jsx";
import HeartButton from "./HeartButton.jsx";

const dateText = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/*
  One card. The title is the link and it stretches over the whole card, so a click anywhere opens
  the animation. The heart sits above that link, so it can be pressed without opening the page.
*/
export default function AnimationCard({ animation, isNew, eager }) {
  const a = animation;
  const { statsFor, offerFor, live } = useSite();
  const s = statsFor(a.slug);
  const now = priceNow(a, offerFor(a.slug));

  return (
    <article className="card px-box" data-reveal>
      <div className="card-thumb">
        {/* width and height tell the browser the picture's shape before it loads, so the card does not jump */}
        <img src={folderOf(a) + "thumb.png"} alt="" width="512" height="256" loading={eager ? "eager" : "lazy"} decoding="async" />
        {isNew && <span className="tag tag-new">New</span>}
        {/* every card says what it is: Free, or Paid with its price */}
        {isPaid(a)
          ? <span className="tag tag-price"><b>Paid</b>{now.discount && <s>{now.discount.was}</s>}{now.price}</span>
          : <span className="tag tag-free">Free</span>}
        {now.discount && <span className="tag tag-offer">{now.discount.percent}% off, {now.discount.left} left</span>}
      </div>

      <div className="card-body">
        <div className="card-head">
          <h3><Link to={`/a/${a.slug}`} className="card-link">{a.title}</Link></h3>
          <HeartButton slug={a.slug} title={a.title} showCount={false} />
        </div>
        <p className="card-blurb">{a.blurb}</p>

        <div className="card-foot">
          <span className="stats">
            {live && (
              <>
                <span title="Downloads"><PixelIcon name="download" size={13} /> {compact(s ? s.downloads : 0)}</span>
                <span title="Hearts"><PixelIcon name="heart" size={13} /> {compact(s ? s.hearts : 0)}</span>
              </>
            )}
          </span>
          <span className="date">{dateText(a.added)}</span>
        </div>
      </div>
    </article>
  );
}
