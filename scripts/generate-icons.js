import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const src = path.join(root, 'public', 'icon.svg');

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'favicon-32.png', size: 32 },
];

const svg = await readFile(src);

for (const { name, size } of sizes) {
  const out = path.join(root, 'public', name);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log(`✓ ${name} (${size}×${size})`);
}
