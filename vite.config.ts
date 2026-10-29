import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**/*.ts', 'src/storage/**/*.ts'],
      reporter: ['text', 'html'],
      thresholds: { lines: 90 },
    },
  },
});
