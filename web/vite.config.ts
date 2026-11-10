import { defineConfig } from 'vitest/config';
export default defineConfig({
  build: {
    lib: { entry: 'src/perspective.tsx', name: 'IgnitionECharts', formats: ['umd'], fileName: () => 'IgnitionECharts.js', cssFileName: 'IgnitionECharts' },
    rollupOptions: { external: ['react', 'react-dom'], output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } } },
    sourcemap: false,
  },
  test: { environment: 'jsdom', include: ['src/tests/**/*.test.{ts,tsx}'], maxWorkers: 2 },
});
