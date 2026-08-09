import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Same drive-mapping quirk as calisthenics-tracker — pin the root so
// Rollup's html plugin doesn't canonicalize through the alternate letter.
const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  root: here,
  base: command === 'build' ? '/climbing-tracker/' : '/',
  plugins: [react(), tailwindcss()],
}));
