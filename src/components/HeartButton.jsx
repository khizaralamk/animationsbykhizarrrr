import { useState } from "react";
import PixelIcon from "./PixelIcon.jsx";
import { useSite, compact } from "../store.jsx";

/*
  The heart. Pressing it adds the animation to this visitor's favourites and raises the public
  count by one; pressing again takes it back. A few pixels fly off when it turns on.
*/
export default function HeartButton({ slug, title, showCount = true, className = "" }) {
  const { isHearted, toggleHeart, statsFor, live } = useSite();
  const [burst, setBurst] = useState(0);                   // changes each time a heart is added, to replay the burst
  const on = isHearted(slug);
  const s = statsFor(slug);
  const count = s ? s.hearts : on ? 1 : 0;

  function press(e) {
    e.preventDefault(); e.stopPropagation();
    if (toggleHeart(slug)) setBurst((n) => n + 1);
  }

  return (
    <button type="button" className={"heart " + (on ? "on " : "") + className} aria-pressed={on} onClick={press}
      aria-label={on ? `Remove ${title} from favourites` : `Add ${title} to favourites`} title={on ? "In your favourites" : "Add to favourites"}>
      <span className="heart-icon">
        <PixelIcon name={on ? "heart" : "heartLine"} size={18} />
        {burst > 0 && <span key={burst} className="burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>}
      </span>
      {showCount && (live || on) && <span className="num">{compact(count)}</span>}
    </button>
  );
}
