// ============================================================================
// hand-notes-ai: brand asset generator (source for everything in /public)
//
// Regenerate (run from repo root; tools install into a throwaway dir):
//   T=$(mktemp -d) && (cd $T && npm init -y >/dev/null && npm i opentype.js@1.3.4 svgo sharp)
//   # fonts: IBMPlexSerif-{Regular,Medium,SemiBold,Italic}.ttf + MonaSans.ttf
//   #   from https://github.com/google/fonts (ofl/ibmplexserif, ofl/monasans) → $T/fonts
//   cp scripts/build-assets.mjs $T/ && node $T/build-assets.mjs $T/fonts public app $T/preview
//
// Colors mirror app/globals.css. Change both together.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { optimize } from "svgo";
import sharp from "sharp";

const [fontsDir, publicDir, appDir, previewDir] = process.argv.slice(2);

// ---- Palette (mirrors app/globals.css) -----------------------------------
const C = {
  cream: "#f8f4e9",
  parchment: "#f3e4c7",
  lightCream: "#fff6e5",
  paper: "#fffdf8",
  white: "#ffffff",
  navy: "#212a3b",
  slate: "#3d485e",
  brown: "#663820",
  brownHover: "#7a4528",
  leather: "#8b7355",
  leatherLight: "#a08060",
  tan: "#d4c4a8",
  sage: "#7c9a82",
  mustard: "#d4a853",
  terracotta: "#c8553d",
  darkBg: "#1a1918",
  darkText: "#f7f4ee",
};

// ---- Fonts → paths --------------------------------------------------------
const font = (f) => { const b = fs.readFileSync(path.join(fontsDir, f)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const F = {
  serifSemi: font("IBMPlexSerif-SemiBold.ttf"),
  serifMed: font("IBMPlexSerif-Medium.ttf"),
  serifItalic: font("IBMPlexSerif-Italic.ttf"),
  serifReg: font("IBMPlexSerif-Regular.ttf"),
  sans: font("MonaSans.ttf"),
};
const textPath = (f, str, x, y, size) =>
  f.getPath(str, x, y, size, { kerning: true }).toPathData(2);
const textWidth = (f, str, size) => f.getAdvanceWidth(str, size, { kerning: true });

// ---- Shapes ---------------------------------------------------------------
// 4-point concave sparkle
const sparkle = (cx, cy, r, fill) =>
  `<path fill="${fill}" d="M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z"/>`;

// Seeded RNG so the "handwriting" is identical on every build
const rng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

// Cursive glyph strokes, relative to baseline (x-height ≈ 7)
const GLYPHS = [
  { d: "c1-6 5-6 5 0", dx: 5 }, // n hump
  { d: "c1-6 5-6 5 0", dx: 5 },
  { d: "c3-1 5-4 4-6c-1-2-5 0-5 3c0 3 3 4 6 3", dx: 5 }, // e
  { d: "c3-3 6-10 5-14c-1-3-4-1-4 4c0 5 1 9 4 10", dx: 5 }, // l
  { d: "c-1-4 3-7 5-6c2 1 1 6-2 6c-2 0-2-3 0-3c1 0 3 1 4 3", dx: 7 }, // o
  { d: "c1-4 5-5 5-1c0 4 0 9-3 10c-3 0-2-5 1-7c2-1 4-2 5-2", dx: 8 }, // g
  { d: "c1-3 2-5 3-6c0 2 0 5 2 6", dx: 5 }, // i
  { d: "c1-3 2-5 3-6c0 2 0 5 2 6", dx: 5 },
];

/** One line of fake cursive between x0..x1 on baseline y. Returns path d. */
function scribbleLine(rand, x0, x1, y, scale = 1) {
  let d = "";
  let x = x0;
  while (x < x1 - 14 * scale) {
    const letters = 2 + Math.floor(rand() * 5);
    const yy = y + (rand() - 0.5) * 1.2;
    d += `M${x.toFixed(1)} ${yy.toFixed(1)}`;
    // lead-in stroke
    d += `c${(1.5 * scale).toFixed(2)} ${(-1 * scale).toFixed(2)} ${(2.5 * scale).toFixed(2)} ${(-2 * scale).toFixed(2)} ${(3 * scale).toFixed(2)} ${(-3 * scale).toFixed(2)}`;
    d += `c${(0.3 * scale).toFixed(2)} ${(1.5 * scale).toFixed(2)} ${(0.2 * scale).toFixed(2)} ${(2.6 * scale).toFixed(2)} ${(0.4 * scale).toFixed(2)} ${(3 * scale).toFixed(2)}`;
    let w = 3.4 * scale;
    for (let i = 0; i < letters && x + w < x1; i++) {
      const g = GLYPHS[Math.floor(rand() * GLYPHS.length)];
      d += g.d.replace(/-?\d*\.?\d+/g, (n) => (parseFloat(n) * scale).toFixed(2));
      w += g.dx * scale;
    }
    // tail
    d += `c${(1.5 * scale).toFixed(2)} ${(-0.6 * scale).toFixed(2)} ${(2.5 * scale).toFixed(2)} ${(-1.5 * scale).toFixed(2)} ${(3 * scale).toFixed(2)} ${(-2.4 * scale).toFixed(2)}`;
    x += w + 3 * scale + (6 + rand() * 4) * scale;
  }
  return d;
}

// ---- 1. Logo mark ---------------------------------------------------------
// Brown tile, cream page with folded corner, a line of handwriting (brown)
// becoming typed text (navy) that ends in an AI sparkle.
function logoMark({ rounded = true, size = 64 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="${rounded ? 15 : 0}" fill="${C.brown}"/>
  <path fill="${C.cream}" d="M21 12H38.5L48 21.5V48A4 4 0 0 1 44 52H21A4 4 0 0 1 17 48V16A4 4 0 0 1 21 12Z"/>
  <path fill="${C.tan}" d="M38.5 12V18.5A3 3 0 0 0 41.5 21.5H48Z"/>
  <path stroke="${C.brown}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M22.5 31.5c1.6-1.2 2.6-3.6 3.4-5.6c.6-1.4 2-1 1.6.6c-.5 2-1.4 4.6-.2 5c1.3.4 2.4-3.6 4-3.8c1.4-.2.4 3.4 1.8 3.6c1.4.2 2.6-2.6 4-2.6c1 0 .6 2.4 1.8 2.4c.9 0 1.8-.9 2.6-1.6"/>
  <path stroke="${C.navy}" stroke-width="2.6" stroke-linecap="round" d="M22.5 39H42.5M22.5 45.5H33"/>
  ${sparkle(39.5, 45.5, 4.6, C.mustard)}
</svg>`;
}

// ---- 2. Wordmark lockups --------------------------------------------------
function logoLockup({ dark = false } = {}) {
  const size = 30;
  const ink = dark ? C.darkText : C.navy;
  const accent = dark ? C.mustard : C.brown;
  const x0 = 52;
  const base = 31;
  const a = "hand-notes-";
  const b = "ai";
  const wa = textWidth(F.serifSemi, a, size);
  const gap = 0;
  const wb = textWidth(F.serifSemi, b, size);
  const W = Math.ceil(x0 + wa + gap + wb + 2);
  const mark = logoMark().replace(/<svg[^>]*>|<\/svg>/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="44" viewBox="0 0 ${W} 44" fill="none">
  <g transform="scale(0.6875)">${mark}</g>
  <path fill="${ink}" d="${textPath(F.serifSemi, a, x0, base, size)}"/>
  <path fill="${accent}" d="${textPath(F.serifSemi, b, x0 + wa + gap, base, size)}"/>
</svg>`;
}

// ---- 3. Hero illustration -------------------------------------------------
function heroIllustration() {
  const rand = rng(7);
  // handwritten page lines
  const lines = [];
  for (let i = 0; i < 9; i++) lines.push(128 + i * 25);
  const ruled = lines
    .map((y) => `<path d="M74 ${y + 1}H266"/>`)
    .join("");
  const heading = scribbleLine(rand, 104, 220, 103, 1.55);
  const bodyLines = lines
    .slice(0, 8)
    .map((y, i) => {
      const end = [256, 250, 236, 256, 180, 252, 244, 200][i];
      return scribbleLine(rand, 104, end, y, 1);
    })
    .join("");
  const todo = scribbleLine(rand, 122, 200, lines[8], 1);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="440" viewBox="0 0 560 440" fill="none">
  <defs>
    <filter id="sh-lg" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="${C.navy}" flood-opacity="0.10"/>
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${C.navy}" flood-opacity="0.06"/>
    </filter>
    <filter id="sh-sm" x="-20%" y="-30%" width="140%" height="170%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="${C.navy}" flood-opacity="0.10"/>
    </filter>
    <clipPath id="card-clip"><rect x="296" y="96" width="228" height="190" rx="14"/></clipPath>
  </defs>

  <!-- soft backdrop -->
  <circle cx="300" cy="226" r="196" fill="${C.lightCream}" opacity="0.75"/>
  <circle cx="300" cy="226" r="150" fill="${C.lightCream}"/>

  <!-- handwritten page -->
  <g transform="rotate(-6 170 230)">
    <g filter="url(#sh-lg)">
      <rect x="60" y="72" width="220" height="300" rx="10" fill="${C.paper}"/>
    </g>
    <g stroke="${C.tan}" stroke-width="1.2" opacity="0.7">${ruled}</g>
    <path d="M94 72V372" stroke="${C.terracotta}" stroke-width="1.2" opacity="0.35"/>
    <!-- binder holes -->
    <g fill="${C.cream}" stroke="${C.tan}" stroke-width="1"><circle cx="76" cy="112" r="4.5"/><circle cx="76" cy="222" r="4.5"/><circle cx="76" cy="332" r="4.5"/></g>
    <g stroke="${C.brown}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="${heading}" stroke-width="2.2"/>
      <path d="${bodyLines}"/>
      <path d="${todo}"/>
    </g>
    <!-- underline swoosh under heading -->
    <path d="M102 111c30-4 70-5 112-2" stroke="${C.mustard}" stroke-width="3" stroke-linecap="round"/>
    <!-- hand-drawn circle around a word on line 5 -->
    <path d="M184 219C182 211 150 210 139 216C130 221 136 231 156 232C176 233 188 227 186 220C185 216 176 213 166 213" stroke="${C.terracotta}" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
    <!-- checkbox doodles -->
    <g stroke="${C.navy}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M104 319h9v9h-9z"/>
      <path d="M106 323l2.5 3l5-7"/>
    </g>
  </g>

  <!-- pen -->
  <g transform="rotate(-38 236 352)" filter="url(#sh-sm)">
    <rect x="160" y="344" width="122" height="15" rx="7.5" fill="${C.navy}"/>
    <rect x="160" y="344" width="44" height="15" rx="7.5" fill="${C.slate}"/>
    <rect x="198" y="344" width="5" height="15" fill="${C.mustard}"/>
    <rect x="170" y="340" width="26" height="4" rx="2" fill="${C.mustard}"/>
    <path d="M282 345.5L306 351.5L282 357.5Z" fill="${C.brown}"/>
    <path d="M290 351.5H304" stroke="${C.mustard}" stroke-width="1.2" stroke-linecap="round"/>
  </g>

  <!-- transform arrow -->
  <path d="M222 62C250 36 292 36 318 62" stroke="${C.brown}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1 7"/>
  <path d="M308 58.5L319 63L315.5 51.5" stroke="${C.brown}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  ${sparkle(272, 28, 7, C.mustard)}
  ${sparkle(342, 76, 3.5, C.brown)}

  <!-- digital note card -->
  <g filter="url(#sh-lg)">
    <rect x="296" y="96" width="228" height="190" rx="14" fill="${C.white}"/>
  </g>
  <g clip-path="url(#card-clip)">
    <rect x="296" y="96" width="228" height="44" fill="${C.cream}"/>
    <path d="M296 140H524" stroke="${C.navy}" stroke-opacity="0.08"/>
  </g>
  <!-- mini mark in card header -->
  <rect x="312" y="108" width="20" height="20" rx="5" fill="${C.brown}"/>
  <path d="M318 113h5.5l3 3v6.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5v-8a1.5 1.5 0 0 1 1.5-1.5z" fill="${C.cream}"/>
  <rect x="340" y="113" width="84" height="7" rx="3.5" fill="${C.navy}"/>
  <rect x="340" y="124" width="48" height="5" rx="2.5" fill="${C.slate}" opacity="0.35"/>
  ${sparkle(502, 118, 6, C.mustard)}
  <!-- typed lines -->
  <rect x="316" y="156" width="132" height="7" rx="3.5" fill="${C.navy}" opacity="0.8"/>
  <rect x="316" y="174" width="184" height="6" rx="3" fill="${C.slate}" opacity="0.3"/>
  <rect x="311" y="185" width="160" height="14" rx="4" fill="${C.mustard}" opacity="0.4"/>
  <rect x="316" y="189" width="148" height="6" rx="3" fill="${C.navy}" opacity="0.55"/>
  <rect x="316" y="206" width="170" height="6" rx="3" fill="${C.slate}" opacity="0.3"/>
  <circle cx="320" cy="230" r="3" fill="${C.brown}"/>
  <rect x="330" y="227" width="124" height="6" rx="3" fill="${C.slate}" opacity="0.3"/>
  <circle cx="320" cy="247" r="3" fill="${C.brown}"/>
  <rect x="330" y="244" width="92" height="6" rx="3" fill="${C.slate}" opacity="0.3"/>

  <!-- user bubble (matches .transcript-bubble-user) -->
  <g filter="url(#sh-sm)">
    <path d="M370 292H508A16 16 0 0 1 524 308V334A4 4 0 0 1 520 338H370A16 16 0 0 1 354 322V308A16 16 0 0 1 370 292Z" fill="${C.brown}"/>
  </g>
  <rect x="372" y="306" width="110" height="6" rx="3" fill="${C.white}" opacity="0.9"/>
  <rect x="372" y="318" width="66" height="6" rx="3" fill="${C.white}" opacity="0.55"/>

  <!-- assistant bubble (matches .transcript-bubble-assistant) -->
  <g filter="url(#sh-sm)">
    <path d="M334 350H486A16 16 0 0 1 502 366V386A16 16 0 0 1 486 402H322A4 4 0 0 1 318 398V366A16 16 0 0 1 334 350Z" fill="${C.lightCream}"/>
  </g>
  <path d="M334 350H486A16 16 0 0 1 502 366V386A16 16 0 0 1 486 402H322A4 4 0 0 1 318 398V366A16 16 0 0 1 334 350Z" stroke="${C.navy}" stroke-opacity="0.12"/>
  <circle cx="296" cy="390" r="12" fill="${C.navy}"/>
  ${sparkle(296, 390, 6.5, C.mustard)}
  <rect x="336" y="366" width="140" height="6" rx="3" fill="${C.navy}" opacity="0.7"/>
  <rect x="336" y="378" width="120" height="6" rx="3" fill="${C.navy}" opacity="0.35"/>
  <rect x="336" y="390" width="76" height="6" rx="3" fill="${C.navy}" opacity="0.35"/>

  <!-- confetti -->
  ${sparkle(538, 236, 5, C.sage)}
  ${sparkle(44, 400, 6, C.mustard)}
  <circle cx="530" cy="78" r="3" fill="${C.terracotta}" opacity="0.6"/>
  <circle cx="40" cy="132" r="3.5" fill="${C.sage}" opacity="0.7"/>
</svg>`;
}

// ---- 3b. Library hero desk scene (globe, lamp, notebooks) ----------------
// Matches .library-hero-card: sits on parchment, transparent background.
function heroDesk() {
  const rand = rng(21);
  const leather = { dark: "#4f2c19", base: "#663820", light: "#8a5232" };
  const navyCloth = { dark: "#1b2333", base: "#2c3a52", light: "#41526f" };
  const rust = { dark: "#6e3520", base: "#8c4a2f", light: "#a9603f" };
  const sageCloth = { dark: "#4f6655", base: "#6f8a74", light: "#8aa38e" };

  const grad = (id, c) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset="0.55" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>`;
  const gradH = (id, c) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.dark}"/><stop offset="0.45" stop-color="${c.light}"/><stop offset="1" stop-color="${c.base}"/></linearGradient>`;

  // Closed notebook lying flat, seen from the front: page-block or spine
  const flatPages = (x, y, w, h, fill) => {
    let lines = "";
    for (let ly = y + 7; ly < y + h - 5; ly += 2.4) lines += `M${x + 5} ${ly.toFixed(1)}H${x + w - 3}`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#${fill})"/>
    <rect x="${x + 4}" y="${y + 5}" width="${w - 6}" height="${h - 10}" rx="1.5" fill="${C.paper}"/>
    <path d="${lines}" stroke="#e3d4b6" stroke-width="0.8"/>
    <path d="M${x + 4} ${y + 5}H${x + w - 2}" stroke="${C.navy}" stroke-opacity="0.12"/>`;
  };
  const flatSpine = (x, y, w, h, fill) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#${fill})"/>
    <rect x="${x + 12}" y="${y}" width="3" height="${h}" fill="${C.mustard}" opacity="0.9"/>
    <rect x="${x + w - 17}" y="${y}" width="3" height="${h}" fill="${C.mustard}" opacity="0.9"/>
    <rect x="${x + w / 2 - 20}" y="${y + h / 2 - 5}" width="40" height="10" rx="2" fill="${C.lightCream}"/>
    <path d="M${x + w / 2 - 14} ${y + h / 2}h28" stroke="${C.leather}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M${x + 4} ${y + 3}H${x + w - 4}" stroke="#fff" stroke-opacity="0.18"/>`;
  // Upright notebook (spine facing us)
  const upright = (x, y, w, h, fill) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="url(#${fill})"/>
    <rect x="${x}" y="${y + 9}" width="${w}" height="2.5" fill="${C.mustard}" opacity="0.85"/>
    <rect x="${x}" y="${y + h - 13}" width="${w}" height="2.5" fill="${C.mustard}" opacity="0.85"/>
    <rect x="${x + w / 2 - 2.5}" y="${y + 22}" width="5" height="${h * 0.38}" rx="1" fill="${C.lightCream}" opacity="0.85"/>`;

  // Open spiral notebook (perspective)
  const leftPage = (dy = 0) =>
    `M246 ${250 + dy}C226 ${244 + dy} 196 ${244 + dy} 172 ${248 + dy}L184 ${212 + dy}C204 ${208 + dy} 228 ${208 + dy} 246 ${214 + dy}Z`;
  const rightPage = (dy = 0) =>
    `M246 ${250 + dy}C266 ${244 + dy} 296 ${244 + dy} 320 ${248 + dy}L308 ${212 + dy}C288 ${208 + dy} 264 ${208 + dy} 246 ${214 + dy}Z`;
  const rule = (side, f) => {
    const y = 250 - 36 * f;
    if (side === "L") {
      const lx = 172 + 12 * f + 5;
      const ly = 248 - 36 * f;
      return `M${lx.toFixed(1)} ${ly.toFixed(1)}Q209 ${(y - 5).toFixed(1)} 243 ${y.toFixed(1)}`;
    }
    const rx = 320 - 12 * f - 5;
    const ry = 248 - 36 * f;
    return `M249 ${y.toFixed(1)}Q283 ${(y - 5).toFixed(1)} ${rx.toFixed(1)} ${ry.toFixed(1)}`;
  };
  const fr = [0.2, 0.36, 0.52, 0.68, 0.84];
  const rules = fr.map((f) => rule("L", f) + rule("R", f)).join("");
  // handwriting sits just above each rule (small scale)
  const hw = [
    scribbleLine(rand, 188, 238, 250 - 36 * 0.84 - 2.2, 0.4),
    scribbleLine(rand, 186, 240, 250 - 36 * 0.68 - 2.2, 0.4),
    scribbleLine(rand, 184, 232, 250 - 36 * 0.52 - 2.4, 0.4),
    scribbleLine(rand, 182, 214, 250 - 36 * 0.36 - 2.6, 0.4),
    scribbleLine(rand, 254, 300, 250 - 36 * 0.84 - 2.2, 0.4),
    scribbleLine(rand, 254, 292, 250 - 36 * 0.68 - 2.2, 0.4),
    scribbleLine(rand, 254, 280, 250 - 36 * 0.52 - 2.4, 0.4),
  ].join("");
  let spiral = "";
  for (let y = 216; y <= 246; y += 4.3) spiral += `<ellipse cx="246" cy="${y.toFixed(1)}" rx="3.2" ry="1.7"/>`;

  // Globe
  const gx = 196, gy = 112, gr = 56;
  let grid = "";
  for (const k of [-0.6, -0.3, 0, 0.3, 0.6]) {
    const yy = gy + k * gr;
    const half = Math.sqrt(1 - k * k) * gr;
    grid += `<ellipse cx="${gx}" cy="${yy.toFixed(1)}" rx="${half.toFixed(1)}" ry="${(half * 0.18).toFixed(1)}"/>`;
  }
  for (const k of [0.25, 0.55, 0.85]) grid += `<ellipse cx="${gx}" cy="${gy}" rx="${(gr * k).toFixed(1)}" ry="${gr}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="356" height="226" viewBox="16 40 356 226" fill="none">
  <defs>
    ${grad("lea", leather)}${grad("nav", navyCloth)}${grad("rus", rust)}
    ${gradH("lea-v", leather)}${gradH("nav-v", navyCloth)}${gradH("sag-v", sageCloth)}
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7d5e27"/><stop offset="0.4" stop-color="#e2bf74"/><stop offset="0.7" stop-color="#b8913f"/><stop offset="1" stop-color="#7d5e27"/>
    </linearGradient>
    <linearGradient id="brass-v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e8c983"/><stop offset="0.5" stop-color="#b8913f"/><stop offset="1" stop-color="#6f5222"/>
    </linearGradient>
    <radialGradient id="ocean" cx="0.36" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#f6ecd4"/><stop offset="0.55" stop-color="#e2cda2"/><stop offset="1" stop-color="#b8986a"/>
    </radialGradient>
    <radialGradient id="globe-shade" cx="0.36" cy="0.3" r="0.75">
      <stop offset="0.5" stop-color="${C.navy}" stop-opacity="0"/><stop offset="1" stop-color="${C.navy}" stop-opacity="0.32"/>
    </radialGradient>
    <radialGradient id="globe-shine" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lamp-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffe6a3" stop-opacity="0.75"/><stop offset="1" stop-color="#ffe6a3" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="page-shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.navy}" stop-opacity="0"/><stop offset="1" stop-color="${C.navy}" stop-opacity="0.10"/>
    </linearGradient>
    <clipPath id="globe-clip"><circle cx="${gx}" cy="${gy}" r="${gr}"/></clipPath>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${C.navy}" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- ground shadow -->
  <ellipse cx="196" cy="252" rx="176" ry="9" fill="${C.navy}" opacity="0.09"/>

  <!-- stacked notebooks (left) -->
  <g filter="url(#soft)">
    ${flatPages(22, 214, 132, 28, "lea")}
    ${flatSpine(30, 190, 118, 24, "nav")}
    ${flatPages(26, 168, 112, 22, "rus")}
    <rect x="${26 + 112 - 22}" y="168" width="3.5" height="22" fill="${C.navy}" opacity="0.85"/>
    <path d="M62 186v20l3.5-3.5 3.5 3.5v-20z" fill="${C.terracotta}"/>
  </g>

  <!-- upright notebooks (behind lamp) -->
  <g filter="url(#soft)">
    ${upright(264, 148, 13, 86, "lea-v")}
    ${upright(278, 156, 11, 78, "nav-v")}
    ${upright(290, 142, 14, 92, "sag-v")}
  </g>

  <!-- globe stand -->
  <path d="M168 232c0-8 12-12 28-12s28 4 28 12z" fill="url(#brass-v)"/>
  <ellipse cx="196" cy="232" rx="30" ry="6.5" fill="url(#brass)"/>
  <rect x="191.5" y="176" width="9" height="46" rx="3" fill="url(#brass)"/>
  <ellipse cx="196" cy="198" rx="7" ry="3" fill="url(#brass)"/>
  <ellipse cx="196" cy="179" rx="9" ry="3.5" fill="url(#brass)"/>

  <!-- globe -->
  <g>
    <circle cx="${gx}" cy="${gy}" r="${gr}" fill="url(#ocean)"/>
    <g clip-path="url(#globe-clip)">
      <g transform="rotate(-20 ${gx} ${gy})" fill="#8b7355" fill-opacity="0.9">
        <path d="M156 66c10-9 27-7 31 3c3 8-6 12-4 20c2 9 13 10 11 22c-2 10-15 12-17 24c-2 9 4 18-2 25c-7-4-9-14-11-23c-3-10-12-14-12-26c0-10 8-14 6-24c-1-6-7-9-2-21z"/>
        <path d="M208 58c8-4 19-2 23 6c3 6-2 10 2 16c5 6 15 6 17 16c2 10-6 18-10 26c-4 8-2 19-11 23c-8-2-8-15-12-23c-4-8-15-10-15-20c0-8 8-10 6-18c-1-6-6-10 0-26z"/>
        <path d="M232 132c6-2 12 2 12 8c0 6-6 9-11 7c-4-2-5-13-1-15z"/>
        <path d="M176 52c6-3 14-2 16 2c-3 4-12 5-16-2z"/>
      </g>
      <g stroke="#7a6240" stroke-opacity="0.28" stroke-width="0.8">${grid}</g>
      <circle cx="${gx}" cy="${gy}" r="${gr}" fill="url(#globe-shade)"/>
      <ellipse cx="${gx - 20}" cy="${gy - 24}" rx="22" ry="15" fill="url(#globe-shine)"/>
    </g>
    <circle cx="${gx}" cy="${gy}" r="${gr}" stroke="#6f5222" stroke-opacity="0.35"/>
  </g>
  <!-- meridian ring -->
  <path d="M${gx} ${gy - 64}A64 64 0 0 1 ${gx} ${gy + 64}" stroke="url(#brass-v)" stroke-width="5" stroke-linecap="round"/>
  <circle cx="${gx}" cy="${gy - 64}" r="3.5" fill="#d9b46a"/>
  <circle cx="${gx}" cy="${gy + 64}" r="3.5" fill="#b8913f"/>

  <!-- warm light pool -->
  <ellipse cx="252" cy="226" rx="86" ry="30" fill="url(#lamp-glow)"/>

  <!-- desk lamp -->
  <g>
    <path d="M280 236c0-9 11-14 24-14s24 5 24 14z" fill="url(#brass-v)"/>
    <ellipse cx="304" cy="236" rx="24" ry="5" fill="url(#brass)"/>
    <path d="M305 226L313 114" stroke="url(#brass)" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M313 114L283 86" stroke="url(#brass)" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="313" cy="114" r="5" fill="#b8913f"/>
    <circle cx="313" cy="114" r="2" fill="#7d5e27"/>
    <circle cx="283" cy="86" r="4.5" fill="#b8913f"/>
    <g transform="translate(280 90) rotate(38)">
      <path d="M-8-8H8L22 22C14 27-14 27-22 22Z" fill="url(#brass)"/>
      <ellipse cx="0" cy="22" rx="22" ry="5" fill="#fff1c9"/>
      <ellipse cx="0" cy="22.5" rx="13" ry="3" fill="#fffaf0"/>
      <rect x="-4" y="-13" width="8" height="6" rx="2" fill="#9c7a3a"/>
    </g>
  </g>

  <!-- open spiral notebook -->
  <g filter="url(#soft)">
    <path d="M246 257C268 250 298 250 326 254L322 250C296 247 266 248 246 253C226 248 196 247 170 250L166 254C194 250 224 250 246 257Z" fill="url(#lea)"/>
    <path d="${leftPage(3)}" fill="#ecdfc3"/>
    <path d="${rightPage(3)}" fill="#ecdfc3"/>
    <path d="${leftPage(1.5)}" fill="#f4e9d2"/>
    <path d="${rightPage(1.5)}" fill="#f4e9d2"/>
    <path d="${leftPage()}" fill="${C.paper}"/>
    <path d="${rightPage()}" fill="${C.paper}"/>
  </g>
  <path d="${leftPage()}" fill="url(#page-shade)"/>
  <g stroke="#cdbb98" stroke-width="0.8" opacity="0.9"><path d="${rules}"/></g>
  <path d="M190 210.6L178 247.4" stroke="${C.terracotta}" stroke-opacity="0.35" stroke-width="0.8"/>
  <g stroke="${C.brown}" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"><path d="${hw}"/></g>
  <!-- tiny doodle: circled star on right page -->
  <ellipse cx="298" cy="234" rx="8" ry="4.5" stroke="${C.terracotta}" stroke-width="0.9" transform="rotate(-6 298 234)"/>
  ${sparkle(298, 234, 3.2, C.mustard)}
  <g stroke="${C.slate}" stroke-width="1.2" fill="${C.paper}">${spiral}</g>

  <!-- pencil -->
  <g transform="translate(-4 -6) rotate(-14 334 258)">
    <rect x="296" y="254" width="58" height="7" rx="1.5" fill="${C.mustard}"/>
    <rect x="296" y="257" width="58" height="1.2" fill="#b58b3a"/>
    <rect x="290" y="254" width="7" height="7" rx="1.5" fill="${C.terracotta}"/>
    <rect x="295.5" y="254" width="4" height="7" fill="${C.tan}"/>
    <path d="M354 254L365 257.5L354 261Z" fill="${C.tan}"/>
    <path d="M361.5 256.4L365 257.5L361.5 258.6Z" fill="${C.navy}"/>
  </g>
</svg>`;
}

// ---- 4. Empty-state illustration -----------------------------------------
function emptyNotes() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180" viewBox="0 0 240 180" fill="none">
  <defs>
    <filter id="es" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="${C.navy}" flood-opacity="0.10"/>
    </filter>
  </defs>
  <ellipse cx="120" cy="160" rx="76" ry="7" fill="${C.navy}" opacity="0.05"/>
  <g transform="rotate(-9 104 92)" filter="url(#es)"><rect x="58" y="26" width="96" height="124" rx="8" fill="${C.lightCream}"/></g>
  <g transform="rotate(5 132 92)">
    <g filter="url(#es)"><rect x="84" y="22" width="96" height="124" rx="8" fill="${C.paper}"/></g>
    <g stroke="${C.tan}" stroke-width="1.2" opacity="0.8">
      <path d="M96 56H168M96 74H168M96 92H168M96 110H168M96 128H168"/>
    </g>
    <path d="M100 22V146" stroke="${C.terracotta}" stroke-width="1.1" opacity="0.3"/>
  </g>
  <!-- dashed add circle -->
  <circle cx="134" cy="88" r="20" fill="${C.cream}" stroke="${C.brown}" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/>
  <path d="M134 80V96M126 88H142" stroke="${C.brown}" stroke-width="2.4" stroke-linecap="round"/>
  <!-- pencil -->
  <g transform="rotate(32 196 120)">
    <rect x="160" y="114" width="58" height="11" rx="2" fill="${C.mustard}"/>
    <rect x="160" y="114" width="10" height="11" rx="2" fill="${C.terracotta}" opacity="0.85"/>
    <rect x="168" y="114" width="4" height="11" fill="${C.tan}"/>
    <path d="M218 114L231 119.5L218 125Z" fill="${C.tan}"/>
    <path d="M226.5 117.6L231 119.5L226.5 121.4Z" fill="${C.navy}"/>
  </g>
  ${sparkle(46, 46, 6, C.mustard)}
  ${sparkle(200, 34, 4, C.brown)}
  <circle cx="34" cy="120" r="3" fill="${C.sage}" opacity="0.7"/>
</svg>`;
}

// ---- 4b. 404 illustration: a note folded into a paper plane, flown off course
function notFoundArt() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220" fill="none">
  <defs>
    <filter id="nf" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="${C.navy}" flood-opacity="0.14"/>
    </filter>
    <clipPath id="nf-wing"><path d="M118 112L262 52L176 136Z"/></clipPath>
  </defs>
  <ellipse cx="160" cy="200" rx="110" ry="8" fill="${C.navy}" opacity="0.06"/>
  <!-- dotted flight path looping back -->
  <path d="M28 168C54 120 98 172 86 132C76 98 40 112 58 140C72 162 104 134 118 112" stroke="${C.brown}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 8"/>
  <!-- paper plane made of ruled paper -->
  <g filter="url(#nf)">
    <path d="M118 112L262 52L176 136Z" fill="${C.paper}"/>
    <path d="M176 136L262 52L190 166Z" fill="${C.lightCream}"/>
    <path d="M176 136L190 166L170 146Z" fill="${C.tan}"/>
  </g>
  <g clip-path="url(#nf-wing)" stroke="#cfe0ea" stroke-width="1.2">
    <path d="M110 96L270 96M110 108L270 108M110 120L270 120M110 84L270 84M110 72L270 72M110 60L270 60"/>
  </g>
  <path d="M136 106L136 128" stroke="${C.terracotta}" stroke-opacity="0.4" stroke-width="1.2" clip-path="url(#nf-wing)"/>
  <path d="M118 112L262 52L176 136Z" stroke="${C.navy}" stroke-opacity="0.18"/>
  <path d="M176 136L262 52" stroke="${C.navy}" stroke-opacity="0.22"/>
  <!-- question mark sparkle cluster -->
  <path d="M244 112c0-10 16-10 16 0c0 7-8 7-8 14" stroke="${C.brown}" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <circle cx="252" cy="134" r="2.4" fill="${C.brown}"/>
  ${sparkle(282, 92, 7, C.mustard)}
  ${sparkle(222, 150, 4, C.sage)}
  ${sparkle(48, 70, 5, C.mustard)}
  <circle cx="300" cy="150" r="3" fill="${C.terracotta}" opacity="0.6"/>
</svg>`
}

// ---- 5. Paper patterns ----------------------------------------------------
const patternDots = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" fill="${C.navy}" fill-opacity="0.12"/></svg>`;
const patternRuled = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M0 31.5H32" stroke="${C.navy}" stroke-opacity="0.08"/></svg>`;

// ---- 5b. Note thumbnails: a "photo" of a handwritten page ----------------
// 320x240 (4:3). Page sits slightly rotated on the parchment desk.
const NOTE_DOODLES = {
  // cell with nucleus + mitochondria
  cell: (ink, accent) => `
    <ellipse cx="226" cy="120" rx="40" ry="31" fill="${accent}" fill-opacity="0.14" stroke="${ink}" stroke-width="1.6"/>
    <circle cx="218" cy="116" r="11" fill="${accent}" fill-opacity="0.38" stroke="${ink}" stroke-width="1.4"/>
    <circle cx="220" cy="114" r="2.6" fill="${ink}"/>
    <g transform="rotate(22 244 134)"><ellipse cx="244" cy="134" rx="9" ry="4.6" stroke="${ink}" stroke-width="1.2" fill="${C.paper}"/><path d="M237 134c2-2 3 2 5 0s3 2 5 0s2 2 4 0" stroke="${accent}" stroke-width="1"/></g>
    <circle cx="204" cy="136" r="2" fill="${ink}" opacity="0.6"/><circle cx="236" cy="104" r="1.8" fill="${ink}" opacity="0.6"/>
    <path d="M214 105L204 82M246 140L262 162" stroke="${ink}" stroke-width="1" stroke-linecap="round"/>`,
  // block on an incline with force arrows
  incline: (ink, accent) => `
    <path d="M186 190H272V118Z" fill="${accent}" fill-opacity="0.12" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>
    <g transform="rotate(-39.9 232 152)"><rect x="220" y="134" width="24" height="18" fill="${C.paper}" stroke="${ink}" stroke-width="1.5"/></g>
    <path d="M226 146V180" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/><path d="M222 174l4 7 4-7" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M232 138l-12-14" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/><path d="M218 130l1-7 7 1" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M200 190a14 14 0 0 0-2-9" stroke="${ink}" stroke-width="1"/>`,
  // timeline with milestones
  timeline: (ink, accent) => `
    <path d="M190 140H280" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M276 136l5 4-5 4" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    ${[198, 218, 240, 262].map((x, i) => `<circle cx="${x}" cy="140" r="4.2" fill="${i === 2 ? accent : C.paper}" stroke="${ink}" stroke-width="1.4"/><path d="M${x} ${i % 2 ? 146 : 134}V${i % 2 ? 160 : 120}" stroke="${ink}" stroke-width="0.9" stroke-dasharray="2 2"/>`).join("")}
    <path d="M232 96v-20l14 5-14 5" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round" fill="${accent}" fill-opacity="0.3"/>`,
  // axes + curve + tangent
  graph: (ink, accent) => `
    <path d="M196 196V84M196 196H284" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M192 90l4-7 4 7M278 192l7 4-7 4" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M202 186C222 182 238 160 250 132C258 112 266 100 278 94" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
    <path d="M222 182L276 104" stroke="${ink}" stroke-width="1.2" stroke-dasharray="4 3" stroke-linecap="round"/>
    <circle cx="248" cy="137" r="3.4" fill="${accent}" stroke="${ink}" stroke-width="1.2"/>`,
};

function noteThumb({ seed, ink, accent, doodle, tilt = -2 }) {
  const rand = rng(seed);
  const lineYs = [];
  for (let y = 66; y < 250; y += 18) lineYs.push(y);
  const ruled = lineYs.map((y) => `M24 ${y}H296`).join("");
  const heading = scribbleLine(rand, 52, 168, 48, 1.25);
  const body = lineYs
    .slice(0, 9)
    .map((y, i) => {
      const inDoodle = y > 70 && y < 205;
      const end = inDoodle ? 176 : 278;
      const short = rand() < 0.28 ? end - 40 - rand() * 50 : end;
      const indent = i % 4 === 1 ? 64 : 52;
      return scribbleLine(rand, indent, short, y - 1.5, 0.82);
    })
    .join("");
  const bullets = lineYs
    .slice(0, 9)
    .filter((_, i) => i % 4 === 1)
    .map((y) => `<circle cx="56" cy="${y - 4}" r="1.8" fill="${ink}"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240" fill="none">
  <defs>
    <filter id="pg" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${C.navy}" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="320" height="240" fill="${C.parchment}"/>
  <g transform="rotate(${tilt} 160 150)">
    <rect x="18" y="14" width="284" height="290" rx="4" fill="${C.paper}" filter="url(#pg)"/>
    <path d="${ruled}" stroke="#cfe0ea" stroke-width="1"/>
    <path d="M42 14V304" stroke="${C.terracotta}" stroke-opacity="0.4" stroke-width="1"/>
    <rect x="50" y="38" width="${(110 + rand() * 30).toFixed(0)}" height="12" rx="3" fill="${C.mustard}" opacity="0.38"/>
    <g stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${heading}" stroke-width="1.9"/>
      <path d="${body}" stroke-width="1.25"/>
    </g>
    ${bullets}
    ${NOTE_DOODLES[doodle](ink, accent)}
  </g>
</svg>`;
}

const NOTE_THUMBS = {
  "notes/biology-cells.svg": { seed: 11, ink: C.navy, accent: C.sage, doodle: "cell", tilt: -2 },
  "notes/physics-forces.svg": { seed: 23, ink: "#1f3b63", accent: C.terracotta, doodle: "incline", tilt: 1.5 },
  "notes/history-revolution.svg": { seed: 37, ink: C.brown, accent: C.terracotta, doodle: "timeline", tilt: -1.2 },
  "notes/calculus-derivatives.svg": { seed: 41, ink: C.navy, accent: C.brown, doodle: "graph", tilt: 2 },
};

// ---- 6. Open Graph image (1200x630) --------------------------------------
function ogImage() {
  const hero = heroIllustration()
    .replace(/<svg[^>]*>/, "")
    .replace("</svg>", "")
    .replace(/id="(sh-lg|sh-sm|card-clip)"/g, 'id="og-$1"')
    .replace(/url\(#(sh-lg|sh-sm|card-clip)\)/g, "url(#og-$1)");
  const mark = logoMark().replace(/<svg[^>]*>|<\/svg>/g, "");
  const h1 = ["Your handwritten notes,", "ready to talk back."];
  const sub = "Upload a page. Get clean text. Ask it anything.";
  const brandA = "hand-notes-";
  const wa = textWidth(F.serifSemi, brandA, 34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="${C.cream}"/>
  <rect x="680" y="40" width="480" height="550" rx="28" fill="${C.parchment}"/>
  <g transform="translate(682 128) scale(0.85)">${hero}</g>
  <g transform="translate(80 82) scale(0.8125)">${mark}</g>
  <path fill="${C.navy}" d="${textPath(F.serifSemi, brandA, 146, 118, 34)}"/>
  <path fill="${C.brown}" d="${textPath(F.serifSemi, "ai", 146 + wa, 118, 34)}"/>
  <path fill="${C.navy}" d="${textPath(F.serifSemi, h1[0], 80, 300, 48)}"/>
  <path fill="${C.navy}" d="${textPath(F.serifSemi, h1[1], 80, 362, 48)}"/>
  <path fill="${C.slate}" d="${textPath(F.serifReg, sub, 80, 424, 24)}"/>
  <rect x="80" y="476" width="56" height="5" rx="2.5" fill="${C.brown}"/>
</svg>`;
}

// ---- Pipeline -------------------------------------------------------------
const svgoCfg = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    "preset-default",
    "removeDimensions",
  ],
};
const keepDims = { ...svgoCfg, plugins: [svgoCfg.plugins[0]] };

const write = (dir, name, data) => {
  fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
  fs.writeFileSync(path.join(dir, name), data);
  return path.join(dir, name);
};
const svg = (name, src, cfg = svgoCfg) => {
  const out = optimize(src, cfg).data;
  write(publicDir, name, out);
  return out;
};

const assets = {
  "logo-mark.svg": svg("logo-mark.svg", logoMark()),
  "logo.svg": svg("logo.svg", logoLockup()),
  "logo-dark.svg": svg("logo-dark.svg", logoLockup({ dark: true })),
  "hero-notes.svg": svg("hero-notes.svg", heroIllustration()),
  "hero-desk.svg": svg("hero-desk.svg", heroDesk()),
  ...Object.fromEntries(Object.entries(NOTE_THUMBS).map(([name, opts]) => [name, svg(name, noteThumb(opts))])),
  "empty-notes.svg": svg("empty-notes.svg", emptyNotes()),
  "not-found.svg": svg("not-found.svg", notFoundArt()),
  "pattern-dots.svg": svg("pattern-dots.svg", patternDots, keepDims),
  "pattern-ruled.svg": svg("pattern-ruled.svg", patternRuled, keepDims),
  "icon.svg": svg("icon.svg", logoMark()),
};

// PNG exports
const png = (src, w, h = w) =>
  sharp(Buffer.from(src), { density: 384 }).resize(w, h).png({ compressionLevel: 9 }).toBuffer();

const og = optimize(ogImage(), keepDims).data;
write(publicDir, "og-image.png", await png(og, 1200, 630));
write(publicDir, "apple-touch-icon.png", await png(logoMark({ rounded: false }), 180));

// favicon.ico (PNG-in-ICO, 16/32/48)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => png(logoMark(), s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const o = 6 + i * 16;
  header.writeUInt8(s, o);
  header.writeUInt8(s, o + 1);
  header.writeUInt8(0, o + 2);
  header.writeUInt8(0, o + 3);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(pngs[i].length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += pngs[i].length;
});
write(appDir, "favicon.ico", Buffer.concat([header, ...pngs]));

// Previews for QA (on the backgrounds they will sit on)
const onBg = (src, w, h, bg) =>
  sharp({ create: { width: w, height: h, channels: 4, background: bg } })
    .composite([{ input: Buffer.from(src.replace(/<svg /, `<svg width="${w}" height="${h}" `)), top: 0, left: 0 }])
    .png()
    .toBuffer();
write(
  previewDir,
  "note-thumbs.png",
  await sharp({ create: { width: 1300, height: 250, channels: 4, background: C.cream } })
    .composite(
      await Promise.all(
        Object.keys(NOTE_THUMBS).map(async (name, i) => ({
          input: await png(assets[name], 320, 240),
          top: 5,
          left: 5 + i * 325,
        }))
      )
    )
    .png()
    .toBuffer()
);
write(previewDir, "desk-on-parchment.png", await onBg(assets["hero-desk.svg"], 1140, 810, C.parchment));
write(previewDir, "hero-on-parchment.png", await onBg(assets["hero-notes.svg"], 1120, 880, C.parchment));
write(previewDir, "not-found-on-cream.png", await onBg(assets["not-found.svg"], 640, 440, C.cream));
write(previewDir, "empty-on-cream.png", await onBg(assets["empty-notes.svg"], 480, 360, C.cream));
write(previewDir, "logo-on-cream.png", await onBg(assets["logo.svg"], 0 | 0 || 560, 88, C.cream));
write(previewDir, "logo-dark.png", await onBg(assets["logo-dark.svg"], 560, 88, C.darkBg));
write(previewDir, "og.png", await png(og, 1200, 630));
const marks = await Promise.all([16, 32, 64, 128].map((s) => png(logoMark(), s)));
write(previewDir, "mark-128.png", marks[3]);
write(previewDir, "mark-32.png", marks[1]);
write(previewDir, "mark-16.png", marks[0]);

for (const f of fs.readdirSync(publicDir)) {
  console.log(f.padEnd(22), fs.statSync(path.join(publicDir, f)).size, "bytes");
}
