import { describe, expect, it } from 'vitest';
import { hasData, prepareOption, updateSettings } from '../echarts/options';
import { defaultOption } from '../models/props';
import { mapEvent } from '../events/payloads';
describe('option boundary', () => {
  it('forces rich text and retains data identity without mutating input', () => {
    const data = [[1, 2], [2, 3]];
    const input = { series: [{ type: 'scatter', data }], tooltip: { renderMode: 'html' } };
    const safe = prepareOption(input);
    expect((safe.series as { data: number[][] }[])[0].data).toBe(data);
    expect(safe.tooltip).toMatchObject({ renderMode: 'richText', confine: true });
    expect(input.tooltip.renderMode).toBe('html');
    expect(hasData(prepareOption(defaultOption))).toBe(true);
  });
  it.each([null, [], 'string', { series: [{ type: 'custom' }] }, { x: NaN }, { x: Infinity }, { toolbox: { feature: { dataView: { show: true } } } }, { tooltip: { formatter: () => '' } }, { title: { link: 'javascript:alert(1)' } }, { series: [{ symbol: 'image://https://evil.test/pixel' }] }, { backgroundColor: { image: 'https://evil.test/pixel' } }, JSON.parse('{"__proto__":{"x":1}}')])('rejects unsafe input %#', input => expect(() => prepareOption(input)).toThrow());
  it('constrains nested media and timeline tooltips', () => {
    const result = prepareOption({ baseOption: { series: [{ type: 'pie', tooltip: { renderMode: 'html' } }] }, media: [{ option: { tooltip: { renderMode: 'html' } } }] });
    expect(JSON.stringify(result)).not.toContain('html');
  });
  it('bounds recursive input and oversized text', () => {
    let deep: object = {}; for (let i = 0; i < 70; i++) deep = { child: deep };
    expect(() => prepareOption(deep)).toThrow('limits');
    expect(() => prepareOption({ text: 'x'.repeat(16385) })).toThrow();
  });
  it('distinguishes empty and dataset data', () => {
    expect(hasData({})).toBe(false); expect(hasData({ series: [{ data: [] }] })).toBe(false);
    expect(hasData({ dataset: { source: [[1, 2]] } })).toBe(true);
  });
  it('defines update modes', () => {
    expect(updateSettings('replace')).toMatchObject({ notMerge: true, silent: true });
    expect(updateSettings('merge')).toMatchObject({ notMerge: false, silent: true });
    expect(updateSettings('replaceMerge').replaceMerge).toContain('series');
  });
});
it('maps bounded events without leaking DOM or arbitrary data', () => {
  expect(mapEvent('onChartClick', { seriesIndex: 0, name: 'x'.repeat(2000), value: [1, 2], event: window, data: { secret: true } })).toEqual({ schemaVersion: 1, seriesIndex: 0, name: 'x'.repeat(1024), value: [1, 2] });
  expect((mapEvent('onDataZoom', { batch: Array.from({ length: 100 }, () => ({ start: 10 })) }).batch as unknown[]).length).toBe(16);
  expect(mapEvent('onLegendSelectChanged', { selected: { A: true, B: 'invalid' } })).toMatchObject({ selected: { A: true } });
});
