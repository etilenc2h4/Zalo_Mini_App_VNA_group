import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import zaloMiniApp from 'zmp-vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [react(), zaloMiniApp()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'www',
    assetsDir: 'assets',
    sourcemap: false,
  },
});

