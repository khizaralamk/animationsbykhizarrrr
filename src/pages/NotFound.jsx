import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <header className="hero">
      <p className="kicker">Nothing here</p>
      <h1>That page<br />does not exist.</h1>
      <p className="lead">The address may have a typo, or the animation was renamed. <Link to="/">See all animations</Link>.</p>
    </header>
  );
}
