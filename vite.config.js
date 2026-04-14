import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    root: '../', // Vitest needs to find tests in src or root
  },
});
