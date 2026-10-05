import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import { SiteProvider } from "./store.jsx";
import "lenis/dist/lenis.css";
import "./styles.css";
import "./cursor.css";

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
