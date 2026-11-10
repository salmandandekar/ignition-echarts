import { test, expect } from '@playwright/test';
import type { Option } from '../src/models/props';
const options: Record<string, Option> = {
  line: { xAxis: { type: 'category', data: ['A', 'B', 'C'] }, yAxis: {}, series: [{ type: 'line', data: [1, 2, 3] }] },
  area: { xAxis: {}, yAxis: {}, series: [{ type: 'line', areaStyle: {}, data: [[0, 2], [1, 3]] }] },
  bar: { xAxis: { type: 'category', data: ['A', 'B'] }, yAxis: {}, series: [{ type: 'bar', data: [2, 3] }] },
  pie: { series: [{ type: 'pie', data: [{ name: 'A', value: 2 }, { name: 'B', value: 3 }] }] },
  scatter: { xAxis: {}, yAxis: {}, series: [{ type: 'scatter', data: [[1, 2], [2, 4]] }] },
  time: { xAxis: { type: 'time' }, yAxis: {}, series: [{ type: 'line', data: [[1700000000000, 2], [1700000060000, 3]] }] },
  heatmap: { xAxis: { type: 'category', data: ['A', 'B'], splitArea: { show: true } }, yAxis: { type: 'category', data: ['C', 'D'] }, visualMap: { min: 0, max: 5 }, series: [{ type: 'heatmap', data: [[0, 0, 2], [1, 1, 4]] }] },
  gauge: { series: [{ type: 'gauge', data: [{ value: 65, name: 'Load' }] }] },
  candlestick: { xAxis: { type: 'category', data: ['A', 'B'] }, yAxis: {}, series: [{ type: 'candlestick', data: [[1, 2, 0, 3], [2, 3, 1, 4]] }] },
  mixed: { xAxis: { type: 'category', data: ['A', 'B'] }, yAxis: [{ type: 'value' }, { type: 'value' }], series: [{ type: 'bar', data: [1, 2] }, { type: 'line', yAxisIndex: 1, data: [3, 4] }] },
};
for (const renderer of ['canvas', 'svg'] as const) {
  test(`${renderer}: core and advanced charts render, update and clean up`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    for (const [name, option] of Object.entries(options)) {
      await page.evaluate(({ option, renderer }) => window.harness.render({ option, renderer }), { option, renderer });
      await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'ready');
      expect(await page.evaluate(() => window.harness.instance()?.getOption().series)).toHaveLength(name === 'mixed' ? 2 : 1);
      await expect(page.locator(renderer === 'svg' ? '.ie-chart-surface svg' : '.ie-chart-surface canvas').first()).toBeVisible();
    }
    await page.evaluate(option => window.harness.render({ option }), options.line);
    await expect.poll(() => page.evaluate(() => (window.harness.instance()?.getOption().series as unknown[]).length)).toBe(1);
    const screenshot = await page.screenshot(); expect(screenshot.byteLength).toBeGreaterThan(5000);
    await page.screenshot({ path: `test-results/${renderer}-chart.png` });
    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => { window.harness.unmount(); window.harness.render(); });
      await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'ready');
    }
    await page.evaluate(() => window.harness.unmount());
    expect(await page.locator('canvas, .ie-chart-surface svg').count()).toBe(0);
    expect(errors).toEqual([]);
  });
}
test('replacement removes stale series; invalid options recover; tooltips never create HTML', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'ready');
  await page.evaluate(() => window.harness.render({ option: { tooltip: { renderMode: 'html', formatter: '<img src=x onerror=alert(1)>' }, series: [{ type: 'pie', data: [{ name: '<script>bad</script>', value: 2 }] }] } }));
  await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'ready');
  expect(await page.evaluate(() => (window.harness.instance()?.getOption().tooltip as { renderMode: string }[])[0].renderMode)).toBe('richText');
  await expect(page.locator('.ie-chart img, .ie-chart script')).toHaveCount(0);
  await page.evaluate(() => window.harness.render({ option: { series: [{ type: 'unsupported' }] } }));
  await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'error');
  await page.evaluate(() => window.harness.render({ option: {} }));
  await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'empty');
  await page.evaluate(() => window.harness.render({ option: { series: [{ type: 'pie', data: [{ value: 3 }] }] }, exportEnabled: true }));
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download chart image' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('chart.png');
});
test('real click events and responsive resizing retain the chart', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.harness.render({ renderer: 'svg', option: { animation: false, series: [{ type: 'pie', radius: '70%', data: [{ name: 'A', value: 1 }] }] } }));
  await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'ready');
  await page.locator('.ie-chart-surface').click({ position: { x: 400, y: 240 } });
  await expect.poll(() => page.evaluate(() => window.harness.events.length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.harness.events[0])).toMatchObject({ name: 'onChartClick', payload: { schemaVersion: 1, name: 'A' } });
  await page.evaluate(() => { document.getElementById('root')!.style.width = '500px'; });
  await expect.poll(() => page.evaluate(() => window.harness.instance()?.getWidth())).toBe(500);
});
test('production UMD bundle registers and uses host React (structural fixture)', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const outbound: string[] = []; page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:5173') && !r.url().startsWith('data:')) outbound.push(r.url()); });
  await page.goto('/bundle.html');
  await expect(page.locator('.ie-chart')).toHaveAttribute('data-status', 'ready');
  await expect(page.locator('.ie-chart canvas')).toBeVisible();
  expect(errors).toEqual([]); expect(outbound).toEqual([]);
});
test('two real charts update independently without recreating their instances', async ({ page }) => {
  await page.goto('/');
  const pie = (n: number): Option => ({ animation: false, series: [{ type: 'pie', data: [{ name: 'Value', value: n }] }] });
  await page.evaluate(options => window.harness.renderMany(options), [pie(1), pie(2)]);
  await expect(page.locator('.ie-chart[data-status="ready"]')).toHaveCount(2);
  const ids = await page.evaluate(() => window.harness.instances().map(c => c?.id));
  await page.evaluate(options => window.harness.renderMany(options), [pie(9), pie(2)]);
  await expect.poll(() => page.evaluate(() => window.harness.instances().map(c => ((c?.getOption().series as { data: { value: number }[] }[])[0].data[0].value)))).toEqual([9, 2]);
  expect(await page.evaluate(() => window.harness.instances().map(c => c?.id))).toEqual(ids);
  await page.evaluate(() => window.harness.unmount()); await expect(page.locator('.ie-chart')).toHaveCount(0);
});
test('SVG image export produces an actual downloadable SVG', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.harness.render({ renderer: 'svg', exportEnabled: true, option: { animation: false, series: [{ type: 'pie', data: [{ name: 'Value', value: 3 }] }] } }));
  const waiting = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download chart image' }).click();
  const download = await waiting; expect(download.suggestedFilename()).toBe('chart.svg');
  const stream = await download.createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString('utf8')).toContain('<svg');
});
