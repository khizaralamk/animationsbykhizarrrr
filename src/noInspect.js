/*
  MAKING "INSPECT" HARDER TO REACH
  --------------------------------
  Switches off the usual ways into the browser's developer tools on this site:
    the right click menu, F12, Ctrl+Shift+I / J / C, Ctrl+U (view source), and the Mac versions.

  Be clear about what this is: a speed bump, not a lock. Anyone can still open the tools from the
  browser's own menu, and everything a browser shows it has already downloaded. It keeps casual
  visitors from poking around; it does not protect anything.
  What is actually protected (the paid files) is protected on the server, not here.

  To switch it off, set ENABLED to false, or remove the import in main.jsx.
*/
const ENABLED = true;

export function blockInspect() {
  if (!ENABLED) return;

  // the right click menu ("Inspect" lives there)
  window.addEventListener("contextmenu", (e) => e.preventDefault());

  // the keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    const key = (e.key || "").toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;                    // Ctrl on Windows and Linux, Cmd on a Mac
    const devtools =
      key === "f12" ||
      (ctrl && e.shiftKey && (key === "i" || key === "j" || key === "c")) ||
      (e.metaKey && e.altKey && (key === "i" || key === "j" || key === "c" || key === "u")) ||
      (ctrl && key === "u");                                // view source
    if (devtools) { e.preventDefault(); e.stopPropagation(); }
  }, true);
}
