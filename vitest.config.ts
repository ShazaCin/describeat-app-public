import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    // tests/*.spec.ts are Playwright browser tests, not Vitest tests.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/**/*.spec.ts'],
  },
});
