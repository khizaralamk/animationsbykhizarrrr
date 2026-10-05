/*
  PIXEL ICONS
  -----------
  Every icon on the site is drawn here by hand on a small grid, one character per pixel:
  "#" is a filled pixel, "." is empty. To change an icon, edit its drawing. To add one, add a
  drawing and use <PixelIcon name="yours" />. The icon takes the colour of the text around it.
*/
const ART = {
  heart: [
    ".##...##.",
    "####.####",
    "#########",
    "#########",
    ".#######.",
    "..#####..",
    "...###...",
    "....#....",
  ],
  heartLine: [
    ".##...##.",
    "#..#.#..#",
    "#...#...#",
    "#.......#",
    ".#.....#.",
    "..#...#..",
    "...#.#...",
    "....#....",
  ],
  download: [
    "...###...",
    "...###...",
    "...###...",
    ".#######.",
    "..#####..",
    "...###...",
    "....#....",
    "#########",
  ],
  eye: [
    "..#####..",
    ".#.....#.",
    "#..###..#",
    "#..###..#",
    ".#.....#.",
    "..#####..",
  ],
  copy: [
    "..######",
    "..#....#",
    "###....#",
    "#.#....#",
    "#.######",
    "#....#..",
    "######..",
  ],
  arrow: [
    "....#...",
    "....##..",
    "#######.",
    "########",
    "#######.",
    "....##..",
    "....#...",
  ],
  expand: [
    "####..####",
    "#........#",
    "#........#",
    "..........",
    "..........",
    "#........#",
    "#........#",
    "####..####",
  ],
  cart: [
    "##.......",
    ".#######.",
    ".#.....#.",
    ".#######.",
    ".#.......",
    ".#######.",
    "..#...#..",
    "..#...#..",
  ],
  check: [
    ".......##",
    "......##.",
    ".....##..",
    "##..##...",
    ".####....",
    "..##.....",
  ],
  star: [
    "....#....",
    "...###...",
    "#########",
    ".#######.",
    "..#####..",
    ".###.###.",
    ".#.....#.",
  ],
  sun: [
    "....#....",
    ".#..#..#.",
    "..#####..",
    "..#####..",
    "#########",
    "..#####..",
    "..#####..",
    ".#..#..#.",
    "....#....",
  ],
  moon: [
    "..####..",
    ".###....",
    "###.....",
    "###.....",
    "###.....",
    "####...#",
    ".######.",
    "..####..",
  ],
  chip: [
    ".#.#.#.#.",
    "#########",
    "#.......#",
    "#..###..#",
    "#..###..#",
    "#.......#",
    "#########",
    ".#.#.#.#.",
  ],
  screen: [
    "##########",
    "#........#",
    "#.##..##.#",
    "#.##..##.#",
    "#........#",
    "##########",
    "...####...",
    "..######..",
  ],
  lock: [
    "..####..",
    ".#....#.",
    ".#....#.",
    "########",
    "###..###",
    "###..###",
    "########",
  ],
};

export default function PixelIcon({ name, size = 18, title, className = "" }) {
  const rows = ART[name];
  if (!rows) return null;
  const w = rows[0].length, h = rows.length;
  // one path: a 1 x 1 square for every filled pixel, merged along each row
  let d = "";
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      if (row[x] !== "#") { x++; continue; }
      const start = x;
      while (x < w && row[x] === "#") x++;
      d += `M${start} ${y}h${x - start}v1h-${x - start}z`;
    }
  });
  return (
    <svg className={"px-icon " + className} viewBox={`0 0 ${w} ${h}`} width={size * (w / Math.max(w, h))} height={size * (h / Math.max(w, h))}
      shapeRendering="crispEdges" fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : "true"} aria-label={title}>
      <path d={d} />
    </svg>
  );
}
