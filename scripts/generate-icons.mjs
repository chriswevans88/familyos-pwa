import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(iconDir, { recursive: true });

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuf.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 8 + data.length);
  return out;
}

const mix = (a, b, t) => Math.round(a + (b - a) * t);
const rgba = (hex) => {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
};

function roundedRectAlpha(x, y, size, radius) {
  const rx = x < radius ? radius : x > size - radius ? size - radius : x;
  const ry = y < radius ? radius : y > size - radius ? size - radius : y;
  const distance = Math.hypot(x - rx, y - ry);
  if (distance <= radius - 1) return 1;
  if (distance >= radius + 1) return 0;
  return 1 - (distance - (radius - 1)) / 2;
}

function makeIcon(size, maskable = false) {
  const width = size;
  const height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const bgA = rgba('#090b10');
  const bgB = rgba('#171b25');
  const cyan = rgba('#22d3ee');
  const mint = rgba('#6ee7b7');
  const gold = rgba('#f5c542');
  const white = rgba('#f8fafc');
  const dark = rgba('#090b10');
  const radius = maskable ? size * 0.22 : size * 0.2;

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const p = row + 1 + x * 4;
      const a = roundedRectAlpha(x, y, size, radius);
      const t = (x + y) / (size * 2);
      const base = bgA.map((v, i) => mix(v, bgB[i], t));
      const cx = size * 0.52;
      const cy = size * 0.55;
      const glow = Math.max(0, 1 - Math.hypot(x - cx, y - cy) / (size * 0.65));
      raw[p] = mix(base[0], cyan[0], glow * 0.24);
      raw[p + 1] = mix(base[1], mint[1], glow * 0.2);
      raw[p + 2] = mix(base[2], gold[2], glow * 0.12);
      raw[p + 3] = Math.round(255 * a);
    }
  }

  const paintPixel = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const p = y * (width * 4 + 1) + 1 + x * 4;
    raw[p] = color[0];
    raw[p + 1] = color[1];
    raw[p + 2] = color[2];
    raw[p + 3] = color[3];
  };

  const fillCircle = (cx, cy, r, color) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y += 1) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x += 1) {
        if (Math.hypot(x - cx, y - cy) <= r) paintPixel(x, y, color);
      }
    }
  };

  const fillRect = (x0, y0, w, h, color) => {
    for (let y = Math.round(y0); y < Math.round(y0 + h); y += 1) {
      for (let x = Math.round(x0); x < Math.round(x0 + w); x += 1) paintPixel(x, y, color);
    }
  };

  const fillTriangle = (points, color) => {
    const minX = Math.floor(Math.min(...points.map((p) => p[0])));
    const maxX = Math.ceil(Math.max(...points.map((p) => p[0])));
    const minY = Math.floor(Math.min(...points.map((p) => p[1])));
    const maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
    const area = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const p = [x + 0.5, y + 0.5];
        const a = area(points[0], points[1], p);
        const b = area(points[1], points[2], p);
        const c = area(points[2], points[0], p);
        if ((a >= 0 && b >= 0 && c >= 0) || (a <= 0 && b <= 0 && c <= 0)) paintPixel(x, y, color);
      }
    }
  };

  fillCircle(size * 0.5, size * 0.57, size * 0.31, [cyan[0], cyan[1], cyan[2], 130]);
  fillTriangle(
    [
      [size * 0.22, size * 0.5],
      [size * 0.5, size * 0.25],
      [size * 0.78, size * 0.5]
    ],
    white
  );
  fillRect(size * 0.3, size * 0.47, size * 0.4, size * 0.26, white);
  fillRect(size * 0.43, size * 0.57, size * 0.14, size * 0.16, dark);
  fillCircle(size * 0.5, size * 0.78, size * 0.22, [mint[0], mint[1], mint[2], 235]);
  fillCircle(size * 0.38, size * 0.78, size * 0.08, white);
  fillCircle(size * 0.5, size * 0.72, size * 0.1, white);
  fillCircle(size * 0.62, size * 0.78, size * 0.08, white);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

writeFileSync(join(iconDir, 'icon-192.png'), makeIcon(192));
writeFileSync(join(iconDir, 'icon-512.png'), makeIcon(512));
writeFileSync(join(iconDir, 'maskable-512.png'), makeIcon(512, true));
writeFileSync(join(iconDir, 'apple-touch-icon.png'), makeIcon(180));

console.log('Generated FamilyOS icons.');
