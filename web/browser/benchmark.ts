import { test, expect } from '@playwright/test';
import fs from 'node:fs';
test('standalone raw and downsampled rendering plus 1 Hz updates', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'ready');
  const results: unknown[] = [];
  for (const count of [10_000, 100_000, 1_000_000]) {
    for (const sampling of ['none', 'lttb'] as const) {
      const result = await page.evaluate(async ({ count, sampling }) => {
        const frames = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const data = Array.from({ length: count }, (_, i) => [i, Math.sin(i / 100) + Math.cos(i / 47)]);
        window.harness.unmount();
        const start = performance.now();
        window.harness.render({ renderer: 'canvas', option: { animation: false, xAxis: { type: 'value' }, yAxis: { type: 'value' }, dataZoom: [{ type: 'inside' }], series: [{ id: 'signal', type: 'line', showSymbol: false, sampling, data }] } });
        await frames();
        const initialMs = performance.now() - start;
        const zoomMs: number[] = [], frameMs: number[] = [];
        for (let step = 0; step < 10; step++) {
          const now = performance.now(); window.harness.instance()?.dispatchAction({ type: 'dataZoom', start: step, end: 100 - step });
          const after = performance.now(); await frames(); zoomMs.push(performance.now() - now); frameMs.push(performance.now() - after);
        }
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
        const series = window.harness.instance()?.getOption().series as { data: unknown[] }[];
        return { count, sampling, initialMs, zoomMs, twoFrameWaitMs: frameMs, usedJSHeapBytes: memory ?? null, sourceSamplesRetained: series[0].data.length, status: document.querySelector('.ie-chart')?.getAttribute('data-status') };
      }, { count, sampling });
      expect(result.status).toBe('ready'); expect(result.sourceSamplesRetained).toBe(count); results.push(result);
    }
  }
  const updates = await page.evaluate(async () => {
    const results: number[] = [];
    for (let update = 0; update < 5; update++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const now = performance.now();
      window.harness.render({ updateMode: 'replace', option: { animation: false, xAxis: {}, yAxis: {}, series: [0, 1, 2].map(s => ({ id: String(s), type: 'line', showSymbol: false, data: Array.from({ length: 10000 }, (_, i) => [i, Math.sin(i / 100 + update + s)]) })) } });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      results.push(performance.now() - now);
    }
    return results;
  });
  fs.mkdirSync('../benchmarks/results', { recursive: true });
  fs.writeFileSync('../benchmarks/results/standalone.json', JSON.stringify({ recordedAt: new Date().toISOString(), browser: await page.evaluate(() => navigator.userAgent), environment: 'Single standalone headless browser; no Ignition Gateway', trialsPerScenario: 1, coldBrowser: false, results, oneHzThreeSeriesVisibleMs: updates }, null, 2));
});
