import { writeFileSync } from "node:fs";

const p = JSON.parse(process.argv[2] ?? "{}");
const P = {
  bg: "#111214",
  white: "#FFFFFF",
  blue: "#3D8BFF",
  discW: 36,
  discTop: 332,
  discBottom: 692,
  leftX: 272,
  rightX: 716,
  whiteRows: [372, 512, 652],
  blueRows: [442, 582],
  fiber: 40,
  prong: 22,
  prongSpread: 24,
  forkLen: 72,
  whiteTip: 600,
  blueTip: 424,
  ...p,
};

const r = P.discW / 2;
const disc = (x, color) =>
  `<rect x="${x}" y="${P.discTop}" width="${P.discW}" height="${P.discBottom - P.discTop}" rx="${r}" fill="${color}"/>`;

// A fiber leaves the disc as two thin prongs that merge into one thick
// filament, the way myofibrils fan into a Z-disc.
function fiber(fromX, dir, y, tipX, color) {
  if (P.shape === "y") return fiberY(fromX, dir, y, tipX, color);
  return fiberParts(fromX, dir, y, tipX, color);
}

// One closed outline: two arms leave the disc and merge into a single
// filament, so there are no seams between separately stroked pieces.
function fiberY(fromX, dir, y, tipX, color) {
  const X = (dx) => fromX - dir * P.sink + dir * dx;
  const s = P.armOffset;
  const a = P.arm / 2;
  const w = P.fiber / 2;
  const L = P.forkLen + P.sink;
  const C = P.crotch + P.sink;
  const k = L * 0.5;
  const ki = C * 0.5;
  const sweep = dir > 0 ? 1 : 0;
  const d = [
    `M ${X(0)} ${y - s - a}`,
    `C ${X(k)} ${y - s - a}, ${X(L - k)} ${y - w}, ${X(L)} ${y - w}`,
    `L ${tipX} ${y - w}`,
    `A ${w} ${w} 0 0 ${sweep} ${tipX} ${y + w}`,
    `L ${X(L)} ${y + w}`,
    `C ${X(L - k)} ${y + w}, ${X(k)} ${y + s + a}, ${X(0)} ${y + s + a}`,
    `L ${X(0)} ${y + s - a}`,
    `C ${X(ki)} ${y + s - a}, ${X(C - ki)} ${y}, ${X(C)} ${y}`,
    `C ${X(C - ki)} ${y}, ${X(ki)} ${y - s + a}, ${X(0)} ${y - s + a}`,
    "Z",
  ].join(" ");
  return `<path d="${d}" fill="${color}"/>`;
}

function fiberParts(fromX, dir, y, tipX, color) {
  const join = fromX + dir * P.forkLen;
  const c = fromX + dir * P.forkLen * 0.55;
  const prong = (sy) =>
    `<path d="M ${fromX} ${y + sy} C ${c} ${y + sy}, ${c} ${y}, ${join} ${y}" stroke="${color}" stroke-width="${P.prong}" fill="none" stroke-linecap="round"/>`;
  // Tapered filament: full width at the fork, narrowing to a round tip
  const w0 = P.fiber / 2;
  const w1 = (P.fiberTip ?? P.fiber) / 2;
  const body = `<path d="M ${join} ${y - w0} L ${tipX} ${y - w1} A ${w1} ${w1} 0 0 ${dir > 0 ? 1 : 0} ${tipX} ${y + w1} L ${join} ${y + w0} Z" fill="${color}"/>`;
  return [prong(-P.prongSpread), prong(P.prongSpread), body].join("");
}

const leftInner = P.leftX + P.discW;
const rightInner = P.rightX;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<rect width="1024" height="1024" fill="${P.bg}"/>
<g transform="translate(512 512) scale(${P.scale ?? 1}) translate(-512 -512)">
${P.whiteRows.map((y) => fiber(leftInner, 1, y, P.whiteTip, P.white)).join("\n")}
${P.blueRows.map((y) => fiber(rightInner, -1, y, P.blueTip, P.blue)).join("\n")}
${disc(P.leftX, P.white)}
${disc(P.rightX, P.blue)}
</g>
</svg>`;

writeFileSync(process.argv[3], svg);
