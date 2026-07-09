/**
 * Generate a 2048x1024 equirectangular test panorama (PNG) without any
 * image library — pure Node (zlib + manual PNG chunks).
 *
 * The pattern makes it easy to verify a real 360 viewer: sky/ground
 * gradients, horizon, compass direction panels (N/E/S/W as U/T/S/B:
 * Utara/Timur/Selatan/Barat), and meridian grid lines every 15 degrees.
 *
 * Usage: node scripts/generate-panorama.mjs [output.png]
 */

import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 2048;
const H = 1024;

// 5x7 bitmap font for the direction letters (Indonesian: U T S B)
const GLYPHS = {
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
};

const px = new Uint8Array(W * H * 3);

function set(x, y, r, g, b) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
}

const HORIZON = Math.floor(H * 0.55);

// Sky gradient (deep blue -> pale) and ground gradient (warm brown -> dark)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y < HORIZON) {
      const t = y / HORIZON;
      set(x, y, Math.round(40 + 150 * t), Math.round(90 + 130 * t), Math.round(180 + 60 * t));
    } else {
      const t = (y - HORIZON) / (H - HORIZON);
      set(x, y, Math.round(170 - 90 * t), Math.round(140 - 80 * t), Math.round(100 - 60 * t));
    }
  }
}

// Horizon line
for (let x = 0; x < W; x++) {
  for (let dy = -2; dy <= 2; dy++) set(x, HORIZON + dy, 255, 255, 255);
}

// Meridian grid lines every 15 degrees
for (let deg = 0; deg < 360; deg += 15) {
  const x = Math.round((deg / 360) * W);
  const major = deg % 90 === 0;
  for (let y = 0; y < H; y++) {
    if (major || y % 4 < 2) {
      const wLine = major ? 2 : 1;
      for (let dx = 0; dx < wLine; dx++) set(x + dx, y, 255, 255, 255);
    }
  }
}

// Direction panels: center of image (x = W/2) is the initial view (north).
const panels = [
  { letter: "U", frac: 0.5, color: [211, 47, 47] }, // Utara — merah
  { letter: "T", frac: 0.75, color: [56, 142, 60] }, // Timur — hijau
  { letter: "S", frac: 0.0, color: [255, 160, 0] }, // Selatan — oranye (wraps at seam)
  { letter: "B", frac: 0.25, color: [81, 45, 168] }, // Barat — ungu
];

const SCALE = 24; // glyph pixel scale => letters ~120x168 px
for (const { letter, frac, color } of panels) {
  const cx = Math.round(frac * W);
  const glyph = GLYPHS[letter];
  const gw = 5 * SCALE;
  const gh = 7 * SCALE;
  const top = HORIZON - gh - 60;

  // Panel background with border
  const pad = 40;
  for (let y = top - pad; y < top + gh + pad; y++) {
    for (let dx = -(gw / 2 + pad); dx < gw / 2 + pad; dx++) {
      const x = (cx + Math.round(dx) + W) % W;
      const edge =
        y < top - pad + 6 || y >= top + gh + pad - 6 || dx < -(gw / 2 + pad) + 6 || dx >= gw / 2 + pad - 6;
      if (edge) set(x, y, 255, 255, 255);
      else set(x, y, color[0], color[1], color[2]);
    }
  }

  // Letter
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (glyph[row][col] !== "1") continue;
      for (let sy = 0; sy < SCALE; sy++) {
        for (let sx = 0; sx < SCALE; sx++) {
          const x = (cx - gw / 2 + col * SCALE + sx + W) % W;
          set(x, top + row * SCALE + sy, 255, 255, 255);
        }
      }
    }
  }
}

// ---- PNG encoding ----
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type RGB
// scanlines with filter byte 0
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = process.argv[2] ?? "scripts/panorama-demo.png";
writeFileSync(out, png);
console.log(`Wrote ${out} (${(png.length / 1024).toFixed(0)} kB, ${W}x${H})`);
