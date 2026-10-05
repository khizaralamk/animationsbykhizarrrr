import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ANIMATIONS } from "./src/animations.js";

/*
  Publishes the list of animations as /catalog.json.
  The backend reads this file to know which animations exist, which are paid, and which Paddle
  price each paid one is. It is written from src/animations.js, so there is one list to keep.
  Only public facts go in it: no prices, no secrets.
*/
function catalogPlugin() {
  const body = () => JSON.stringify(ANIMATIONS.map((a) => ({
    slug: a.slug,
    title: a.title,
    tier: a.tier === "paid" ? "paid" : "free",
    ...(a.paddlePriceId ? { paddlePriceId: a.paddlePriceId } : {}),
  })));
  return {
    name: "catalog-json",
    configureServer(server) {                                   // while developing
      server.middlewares.use("/catalog.json", (req, res) => {
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(body());
      });
    },
    generateBundle() {                                          // in the built site
      this.emitFile({ type: "asset", fileName: "catalog.json", source: body() });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), catalogPlugin()],
  server: { port: 5173, open: false },
});
