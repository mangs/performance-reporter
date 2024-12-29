import nodePath from 'node:path';
import { defineConfig } from 'vite'; // eslint-disable-line import/no-extraneous-dependencies -- development-only dependency

// eslint-disable-next-line import/no-default-export -- Vite config requires a default export
export default defineConfig({
  build: {
    lib: {
      entry: nodePath.resolve(import.meta.dirname, './src/measure.mts'),
      fileName: 'performance-reporter',
      formats: ['es'],
      name: 'PerformanceReporter',
    },
  },
});
