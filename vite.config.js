import { defineConfig } from 'vite';

// On GitHub Pages the app is served under /SwarmTrader-core/app/.
// Locally (and for preview) the base is '/'.
const base = process.env.GH_PAGES ? '/SwarmTrader-core/app/' : '/';

export default defineConfig({
  base,
  server: {
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});