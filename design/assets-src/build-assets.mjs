// ============================================================================
// hand-notes-ai: brand asset generator (source for everything in /public)
//
// Regenerate (run from repo root; tools install into a throwaway dir):
//   T=$(mktemp -d) && (cd $T && npm init -y >/dev/null && npm i opentype.js@1.3.4 svgo sharp)
//   # fonts: IBMPlexSerif-{Regular,Medium,SemiBold,Italic}.ttf + MonaSans.ttf
//   #   from https://github.com/google/fonts (ofl/ibmplexserif, ofl/monasans) → $T/fonts
//   cp design/assets-src/build-assets.mjs $T/ && node $T/build-assets.mjs $T/fonts public app $T/preview
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

// ---- 5. Paper patterns ----------------------------------------------------
const patternDots = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" fill="${C.navy}" fill-opacity="0.12"/></svg>`;
const patternRuled = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M0 31.5H32" stroke="${C.navy}" stroke-opacity="0.08"/></svg>`;

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
  fs.mkdirSync(dir, { recursive: true });
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
  "empty-notes.svg": svg("empty-notes.svg", emptyNotes()),
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
write(previewDir, "hero-on-parchment.png", await onBg(assets["hero-notes.svg"], 1120, 880, C.parchment));
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
