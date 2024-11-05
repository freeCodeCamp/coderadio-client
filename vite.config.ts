import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  plugins: [react(), viteTsconfigPaths()],
  root: './',
  build: {
    outDir: './build',
    emptyOutDir: true, // also necessary
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3001
    port: 3001
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './testSetup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/*' /* do not include playwright files */
    ]
  }
});
