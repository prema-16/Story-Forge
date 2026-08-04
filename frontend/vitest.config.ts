/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@storyforge/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
