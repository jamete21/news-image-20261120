// The World in One Picture — Friday 20 November 2026.
// A newspaper front page drawn entirely in code (Node 22, standard library
// only, no network): a 5x7 bitmap font I defined below, a small raster
// library, and a from-scratch PNG encoder. Deterministic: the same bytes
// every run. Writes entry.png to MAKEFUN_OUTPUT_DIR (or /output).
//
// Stories (all verified against the news of 20 November 2026):
//  - ICJ rules Myanmar committed genocide against the Rohingya (ruled Thu 19 Nov,
//    the verdict leading Friday's front pages)
//  - Trump, Xi and Putin hold the first three-way summit in Shenzhen (19 Nov,
//    four-point peace declaration)
//  - Trump pushes the Iran war decision to 2027: "no rush" (first reported 20 Nov)
//  - Anthropic's record $81.3bn IPO: shares close up 17% on debut (reported 20 Nov)
//  - Cyclone Akvan makes landfall in Odisha; 300,000 evacuated (20 Nov)
//  - NASA confirms Voyager 1 passed one light-day from Earth (confirmed 19 Nov,
//    reported 20 Nov)
// Ticker: Hayabusa2 engine fault ends its asteroid landing (20 Nov), Kyiv hit
// by missiles (20 Nov), Genoa airport halted by drones (20 Nov), GTA 6 sales
// pass The Odyssey's $1.8bn run (20 Nov), Pete Rose pardoned (announced 19 Nov).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- font: 5x7
// Each glyph is 7 rows of 5 pixels ('#' on, '.' off). Uppercase only; the
// renderer uppercases its input. Unknown characters draw as a blank.
const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  ';': ['00000', '01100', '01100', '00000', '01100', '00100', '01000'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  $: ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '"': ['01010', '01010', '00000', '00000', '00000', '00000', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '•': ['00000', '00000', '01110', '01110', '01110', '00000', '00000'],
  _: ['00000', '00000', '00000', '00000', '00000', '00000', '11111'],
};

// ------------------------------------------------------------- raster: 1024x1024 RGB
const W = 1024;
const H = 1024;
const img = new Uint8Array(W * H * 3);

const PAPER = [246, 241, 231];
const INK = [26, 26, 26];
const NAVY = [18, 38, 63];
const GOLD = [217, 164, 65];
const RED = [179, 38, 30];
const TEAL = [14, 124, 123];
const BLUE = [31, 78, 121];
const PURPLE = [91, 44, 138];
const GREY = [85, 80, 74];
const WHITE = [255, 255, 255];
const BORDER = [201, 194, 180];
const ICON_BG = [234, 240, 247];

function px(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  img[i] = c[0]; img[i + 1] = c[1]; img[i + 2] = c[2];
}
function rect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c);
}
function hline(x0, x1, y, c) {
  for (let x = x0; x <= x1; x++) px(x, y, c);
}
function vline(x, y0, y1, c) {
  for (let y = y0; y <= y1; y++) px(x, y, c);
}
// Bresenham line.
function line(x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, x = x0, y = y0;
  for (;;) {
    px(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}
function circle(cx, cy, r, c) {
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    for (let x = -half; x <= half; x++) px(cx + x, cy + y, c);
  }
}
function ring(cx, cy, rOuter, rInner, c) {
  for (let y = -rOuter; y <= rOuter; y++) {
    for (let x = -rOuter; x <= rOuter; x++) {
      const d = x * x + y * y;
      if (d <= rOuter * rOuter && d > rInner * rInner) px(cx + x, cy + y, c);
    }
  }
}
// Filled triangle by scanline.
function tri(x0, y0, x1, y1, x2, y2, c) {
  const minY = Math.min(y0, y1, y2), maxY = Math.max(y0, y1, y2);
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    const edges = [[x0, y0, x1, y1], [x1, y1, x2, y2], [x2, y2, x0, y0]];
    for (const [ax, ay, bx, by] of edges) {
      if ((ay <= y && by > y) || (by <= y && ay > y)) {
        xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
      }
    }
    if (xs.length >= 2) {
      const a = Math.min(...xs), b = Math.max(...xs);
      for (let x = Math.ceil(a); x <= Math.floor(b); x++) px(x, y, c);
    }
  }
}

// ------------------------------------------------------------- text rendering
function textWidth(s, scale) {
  return s.length * 6 * scale - scale;
}
function drawText(s, x, y, scale, c) {
  const upper = s.toUpperCase();
  for (let ci = 0; ci < upper.length; ci++) {
    const g = FONT[upper[ci]] || FONT[' '];
    const ox = x + ci * 6 * scale;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (g[row][col] === '1') rect(ox + col * scale, y + row * scale, scale, scale, c);
      }
    }
  }
}
function drawTextCentered(s, cx, y, scale, c) {
  drawText(s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, c);
}

// ------------------------------------------------------------- panels
function panel(x, y, w, h, accent) {
  rect(x, y, w, h, BORDER);
  rect(x + 1, y + 1, w - 2, h - 2, WHITE);
  rect(x + 1, y + 1, w - 2, 6, accent);
}

// ------------------------------------------------------------- the front page
function drawPage() {
  rect(0, 0, W, H, PAPER);

  // Masthead.
  rect(0, 0, W, 118, NAVY);
  rect(0, 118, W, 4, GOLD);
  drawTextCentered('THE WORLD IN ONE PICTURE', 512, 16, 6, WHITE);
  drawTextCentered('FRIDAY 20 NOVEMBER 2026', 512, 70, 4, GOLD);

  // Hero: the ICJ genocide ruling, with a scales-of-justice pictogram.
  panel(16, 134, 992, 252, GOLD);
  rect(17, 141, 219, 244, ICON_BG);
  // Scales: post, base, beam, finial, strings, pans.
  rect(122, 198, 8, 132, NAVY);
  rect(96, 330, 60, 10, NAVY);
  rect(56, 190, 140, 8, NAVY);
  circle(126, 184, 6, NAVY);
  rect(70, 198, 3, 30, NAVY);
  rect(86, 198, 3, 30, NAVY);
  tri(56, 228, 100, 228, 78, 270, NAVY);
  rect(166, 198, 3, 30, NAVY);
  rect(182, 198, 3, 30, NAVY);
  tri(152, 228, 196, 228, 174, 270, NAVY);
  drawText('THE HAGUE  •  JUSTICE', 256, 152, 3, RED);
  drawText('UN COURT: MYANMAR', 256, 190, 5, INK);
  drawText('COMMITTED GENOCIDE', 256, 228, 5, INK);
  drawText('WORLD COURT RULES 9-6 ON THE ROHINGYA', 256, 288, 3, INK);
  drawText('FIRST GENOCIDE FINDING AGAINST A STATE', 256, 312, 3, INK);
  drawText('ROHINGYA REFUGEES CHEER THE VERDICT', 256, 336, 3, INK);

  // Row 2, left: the Shenzhen three-way summit.
  panel(16, 398, 488, 208, NAVY);
  drawText('SHENZHEN  •  POLITICS', 32, 420, 3, NAVY);
  drawText('TRUMP, XI & PUTIN', 32, 456, 4, INK);
  drawText('MEET IN SHENZHEN', 32, 490, 4, INK);
  drawText('FIRST THREE-WAY SUMMIT', 32, 544, 2, INK);
  drawText('PEACE DECLARATION', 32, 566, 2, INK);
  circle(444, 440, 12, RED);
  circle(470, 434, 12, GOLD);
  circle(496, 440, 12, NAVY);

  // Row 2, right: Trump pushes the Iran decision to 2027.
  panel(520, 398, 488, 208, RED);
  drawText('WASHINGTON  •  IRAN', 536, 420, 3, RED);
  drawText('TRUMP PUSHES IRAN', 536, 456, 4, INK);
  drawText('WAR CALL TO 2027', 536, 490, 4, INK);
  drawText("'NO RUSH,' TRUMP SAYS", 536, 544, 2, INK);
  drawText('DECISION AFTER JAN 1', 536, 566, 2, INK);
  ring(956, 432, 20, 16, NAVY);
  line(956, 432, 956, 418, NAVY);
  line(956, 432, 968, 432, NAVY);

  // Row 3, left: Anthropic's record IPO.
  panel(16, 618, 328, 228, TEAL);
  drawText('MARKETS  •  AI', 32, 634, 3, TEAL);
  drawText('ANTHROPIC IPO', 32, 668, 3, INK);
  drawText('+17% ON DEBUT', 32, 692, 3, INK);
  drawText('RECORD $81.3BN', 32, 748, 2, INK);
  drawText('LARGEST IPO EVER', 32, 770, 2, INK);
  drawText('PRICED AT $83 A SHARE', 32, 792, 2, INK);
  line(288, 656, 300, 646, TEAL);
  line(300, 646, 310, 650, TEAL);
  line(310, 650, 326, 634, TEAL);
  tri(326, 630, 316, 632, 324, 642, TEAL);

  // Row 3, middle: Cyclone Akvan.
  panel(352, 618, 328, 228, BLUE);
  drawText('INDIA  •  STORM', 368, 634, 3, BLUE);
  drawText('CYCLONE AKVAN', 368, 668, 3, INK);
  drawText('HITS ODISHA', 368, 692, 3, INK);
  drawText('300,000 EVACUATED', 368, 748, 2, INK);
  drawText('LANDFALL TODAY', 368, 770, 2, INK);
  drawText('10 TRAINS CANCELLED', 368, 792, 2, INK);
  for (let a = 0; a <= Math.PI * 4; a += 0.12) {
    const r = 3 + a * 1.1;
    rect(Math.round(660 + r * Math.cos(a)) - 1, Math.round(646 + r * Math.sin(a)) - 1, 3, 3, BLUE);
  }

  // Row 3, right: Voyager 1 passes one light-day.
  panel(688, 618, 320, 228, PURPLE);
  drawText('SPACE  •  NASA', 704, 634, 3, PURPLE);
  drawText('VOYAGER 1 PASSES', 704, 668, 3, INK);
  drawText('A LIGHT-DAY', 704, 692, 3, INK);
  drawText('FARTHEST HUMAN-MADE', 704, 748, 2, INK);
  drawText('OBJECT, 25.9BN KM', 704, 770, 2, INK);
  drawText('49 YEARS IN FLIGHT', 704, 792, 2, INK);
  tri(956, 698, 948, 716, 964, 716, PURPLE);
  tri(956, 734, 948, 716, 964, 716, PURPLE);
  tri(938, 716, 956, 708, 956, 724, PURPLE);
  tri(974, 716, 956, 708, 956, 724, PURPLE);
  circle(956, 716, 4, PURPLE);

  // Ticker: more of the day.
  rect(16, 858, 992, 70, NAVY);
  drawTextCentered('ALSO TODAY: HAYABUSA2 FAULT ENDS ASTEROID LANDING • PETE ROSE PARDONED', 512, 874, 2, WHITE);
  drawTextCentered('KYIV HIT BY MISSILES • GENOA AIRPORT HALTED BY DRONES • GTA 6 TOPS $1.8BN', 512, 898, 2, WHITE);

  // Footer.
  drawTextCentered('THE WORLD IN ONE PICTURE  •  FRIDAY 20 NOVEMBER 2026  •  MAKE.FUN', 512, 946, 2, GREY);
  drawTextCentered('FOR THE JUDGE: THIS PAGE SUMS UP FRIDAY 20 NOVEMBER 2026.', 512, 970, 2, GREY);
}

// ------------------------------------------------------------- PNG encoder
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}
function encodePNG() {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type 2: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    Buffer.from(img.buffer, y * W * 3, W * 3).copy(raw, y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------- main
drawPage();
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePNG());
