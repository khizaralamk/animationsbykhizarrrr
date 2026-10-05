import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import { SiteProvider } from "./store.jsx";
import "lenis/dist/lenis.css";
import "./styles.css";
import "./cursor.css";
import { blockInspect } from "./noInspect.js";
import { loadPaddle } from "./paddle.js";

blockInspect();                                             // right click and the devtools shortcuts are switched off

// A payment link from Paddle arrives as <site>/?_ptxn=txn_... Paddle's script opens the checkout for it by itself.
if (new URLSearchParams(window.location.search).has("_ptxn")) loadPaddle().catch(() => {});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* SiteProvider holds the live counts and this visitor's hearts for every page */}
      <SiteProvider>
        <App />
      </SiteProvider>
    </BrowserRouter>
    {/* Vercel Web Analytics: counts visitors and page views. It only sends data on the deployed site. */}
    <Analytics />
  </React.StrictMode>
);
