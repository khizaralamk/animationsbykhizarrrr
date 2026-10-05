/*
  The launch offer banner: "First 10 buyers get 86% off", with how many places are left.
  It is only drawn while the backend says places are left, so it disappears by itself when they run out.
  "discount" comes from priceNow() in animations.js.
*/
export default function OfferBanner({ discount, price, title }) {
  if (!discount) return null;
  const { limit, left, percent, was } = discount;
  return (
    <div className="offer px-box" role="status">
      <p className="offer-head">First {limit} buyers get {percent}% off</p>
      <p className="offer-text">
        {title ? `${title} is ` : ""}<b>{price}</b> instead of <s>{was}</s>. {left} of {limit} {left === 1 ? "place" : "places"} left, then it goes back to {was}.
      </p>
      <div className="offer-bar" aria-hidden="true">
        {Array.from({ length: limit }, (_, i) => <i key={i} className={i < limit - left ? "gone" : ""} />)}
      </div>
    </div>
  );
}
