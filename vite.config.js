import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// The list of animations reads its Paddle price ids from VITE_PRICE_... environment variables. This file
// runs before Vite has read the .env files, so they are read here first and the list is loaded after.
let ANIMATIONS = [];

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
    ...(a.launch ? { launch: { paddlePriceId: a.launch.paddlePriceId, limit: a.launch.limit } } : {}),
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
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  for (const [name, value] of Object.entries(env)) if (name.startsWith("VITE_PRICE_")) process.env[name] = value;
  ({ ANIMATIONS } = await import("./src/animations.js"));
  return {
    plugins: [react(), catalogPlugin()],
    server: { port: 5173, open: false },
  };
});
