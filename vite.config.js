import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  // REACT_APP_ is kept so the existing Netlify env vars keep working.
  envPrefix: ['VITE_', 'REACT_APP_'],
  server: { port: 3001 },
  preview: { port: 3001 },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}']
  }
});
