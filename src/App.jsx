import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// These two pages pull in the markdown reader, so they are loaded only when someone opens them.
// The home page then downloads less code and shows up sooner.
const AnimationPage = lazy(() => import("./pages/AnimationPage.jsx"));
const MakeYourOwn = lazy(() => import("./pages/MakeYourOwn.jsx"));

// The whole site is four routes: the home page with the cards, one page per animation, the make your own guide, and a 404.
export default function App() {
  return (
    <Suspense fallback={<p className="note" aria-live="polite">Loading...</p>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/a/:slug" element={<AnimationPage />} />
          <Route path="/make-your-own" element={<MakeYourOwn />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
