import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-head">
        <h1>That page does not exist</h1>
        <p className="lead">The address may have a typo, or the animation was renamed.</p>
        <div className="actions"><Link className="btn primary" to="/">See all animations</Link></div>
      </header>
    </div>
  );
}
