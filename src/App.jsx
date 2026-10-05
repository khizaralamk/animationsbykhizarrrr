import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// These pages pull in the markdown reader or are rarely opened, so they are loaded only when
// someone goes there. The home page then downloads less code and shows up sooner.
const AnimationPage = lazy(() => import("./pages/AnimationPage.jsx"));
const MakeYourOwn = lazy(() => import("./pages/MakeYourOwn.jsx"));
const Thanks = lazy(() => import("./pages/Thanks.jsx"));

// The routes: home with the library, one page per animation, the make your own guide,
// the thanks page buyers land on after paying, and a 404.
export default function App() {
  return (
    <Suspense fallback={<p className="note loading" aria-live="polite">Loading...</p>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/a/:slug" element={<AnimationPage />} />
          <Route path="/make-your-own" element={<MakeYourOwn />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
