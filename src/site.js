/*
  FACTS ABOUT THE SITE that several pages use. Change them here and every page follows.
*/
export const SUPPORT_EMAIL = "business.khizaralam@gmail.com";

/*
  The visitor count in the top bar starts from this number, and every different visitor the
  backend has counted is added to it. A visitor is one browser: refreshing, opening more pages or
  coming back another day does not count again.
*/
export const VISITORS_BASE = 61;

/* The pages in the footer's "small print" row. Each is a markdown file in public/legal/. */
export const LEGAL_PAGES = [
  { path: "support", title: "Support", file: "support.md" },
  { path: "refunds", title: "Refunds", file: "refunds.md" },
  { path: "terms", title: "Terms", file: "terms.md" },
  { path: "privacy", title: "Privacy", file: "privacy.md" },
  { path: "licence", title: "Licence", file: "licence.md" },
];
