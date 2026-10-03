import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import AnimationPage from "./pages/AnimationPage.jsx";
import NotFound from "./pages/NotFound.jsx";

// The whole site is three routes: the home page with the cards, one page per animation, and a 404.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/a/:slug" element={<AnimationPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
