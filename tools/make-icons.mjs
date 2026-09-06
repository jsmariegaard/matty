// Tegner app-ikonerne som PNG uden nogen afhængigheder.
// Kør: node tools/make-icons.mjs
import zlib from 'node:zlib';
import fs from 'node:fs';

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return (buf) => { let c = -1; for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(td));
  return Buffer.concat([len, td, crc]);
}

function png(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// Alle mål i et 512x512-koordinatsystem; skaleres til den ønskede størrelse.
const ell = (cx, cy, rx, ry, color, rot = 0) => ({ cx, cy, rx, ry, color: hex(color), rot: rot * Math.PI / 180 });

const SHAPES = [
  ell(136, 268, 54, 118, '#c1832f', 20),   // venstre øre
  ell(376, 268, 54, 118, '#c1832f', -20),  // højre øre
  ell(256, 274, 150, 146, '#dda560'),      // hoved
  ell(256, 214, 104, 52, '#f0d3a2'),        // lys pande
  ell(256, 342, 112, 82, '#f7e3c0'),        // snude
  ell(196, 246, 25, 28, '#2f2118'),         // venstre øje
  ell(318, 246, 25, 28, '#2f2118'),         // højre øje
  ell(205, 236, 9, 9, '#ffffff'),
  ell(327, 236, 9, 9, '#ffffff'),
  ell(256, 312, 44, 33, '#4a342a'),         // næse
  ell(240, 305, 12, 7, '#7a6156'),
  ell(256, 374, 54, 38, '#4a342a'),        // smil (nedre halvdel)
  ell(256, 360, 56, 36, '#f7e3c0'),        // dækkes af snudefarve
];

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  const S = 512 / size;
  const SS = 3; // supersampling
  const bgA = hex('#ffce7a'), bgB = hex('#f5a623');
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const px = (x + (sx + 0.5) / SS) * S, py = (y + (sy + 0.5) / SS) * S;
        const t = py / 512;
        let c = [bgA[0] + (bgB[0] - bgA[0]) * t, bgA[1] + (bgB[1] - bgA[1]) * t, bgA[2] + (bgB[2] - bgA[2]) * t];
        for (const s of SHAPES) {
          const dx = px - s.cx, dy = py - s.cy;
          const ca = Math.cos(-s.rot), sa = Math.sin(-s.rot);
          const rx2 = (dx * ca - dy * sa) / s.rx, ry2 = (dx * sa + dy * ca) / s.ry;
          if (rx2 * rx2 + ry2 * ry2 <= 1) c = s.color;
        }
        r += c[0]; g += c[1]; b += c[2];
      }
      const n = SS * SS, i = (y * size + x) * 4;
      buf[i] = Math.round(r / n); buf[i + 1] = Math.round(g / n); buf[i + 2] = Math.round(b / n); buf[i + 3] = 255;
    }
  }
  return png(size, size, buf);
}

for (const [file, size] of [['icons/icon-192.png', 192], ['icons/icon-512.png', 512], ['icons/apple-touch-icon.png', 180]]) {
  fs.writeFileSync(file, render(size));
  console.log('skrev', file, size + 'px');
}
