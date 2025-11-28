import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true,
    // Redirect all HTML requests to index.html for React Router
    middlewareMode: false,
  },
  // Public directory configuration
  publicDir: 'public',
  // Ensure React Router works properly
  appType: 'spa'
});

