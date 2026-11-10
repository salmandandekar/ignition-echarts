import { expect, it, vi } from 'vitest';
vi.mock('../echarts/engine', () => ({ init: vi.fn() }));
import { ChartController, type Factory } from '../echarts/ChartController';
import { defaults } from '../models/props';
function fixture() {
  const handlers = new Map<string, (e: unknown) => void>();
  const chart = { setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn(), showLoading: vi.fn(), hideLoading: vi.fn(), getDataURL: vi.fn(() => 'data:image/png;base64,test'),
    on: vi.fn((n: string, f: (e: unknown) => void) => handlers.set(n, f)), off: vi.fn((n: string) => handlers.delete(n)) };
  const factory = vi.fn(() => chart), element = document.createElement('div'), status = vi.fn(), event = vi.fn();
  Object.defineProperties(element, { clientWidth: { configurable: true, value: 640 }, clientHeight: { configurable: true, value: 360 } });
  const controller = new ChartController(element, status, event, factory as unknown as Factory);
  return { controller, factory, chart, handlers, element, status, event };
}
it('initializes once for normal updates and releases listeners', () => {
  const f = fixture(); f.controller.configure(defaults, false);
  for (let i = 0; i < 20; i++) f.controller.configure({ ...defaults, option: { ...defaults.option, title: { text: String(i) } } }, false);
  expect(f.factory).toHaveBeenCalledTimes(1); expect(f.chart.setOption).toHaveBeenCalledTimes(21);
  f.controller.resize(); expect(f.chart.resize).toHaveBeenCalled();
  f.controller.dispose(); f.controller.resize(); f.controller.configure(defaults, false);
  expect(f.chart.dispose).toHaveBeenCalledTimes(1); expect(f.chart.off).toHaveBeenCalledTimes(3); expect(f.handlers.size).toBe(0);
});
it('waits for nonzero size', () => {
  const f = fixture(); Object.defineProperty(f.element, 'clientWidth', { value: 0 });
  f.controller.configure(defaults, false); expect(f.factory).not.toHaveBeenCalled();
  Object.defineProperty(f.element, 'clientWidth', { value: 640 }); f.controller.resize();
  expect(f.factory).toHaveBeenCalledTimes(1); f.controller.dispose();
});
it('reinitializes for effective theme and renderer changes', () => {
  const f = fixture(); f.controller.configure({ ...defaults, theme: 'auto' }, false); f.controller.configure({ ...defaults, theme: 'auto' }, true);
  expect(f.factory).toHaveBeenLastCalledWith(f.element, 'dark', { renderer: 'canvas' });
  f.controller.configure({ ...defaults, renderer: 'svg' }, false); expect(f.factory).toHaveBeenCalledTimes(3); expect(f.chart.dispose).toHaveBeenCalledTimes(2); f.controller.dispose();
});
it('handles loading, empty, invalid updates and recovery', () => {
  const f = fixture(); f.controller.configure({ ...defaults, loading: true }, false);
  expect(f.chart.showLoading).toHaveBeenCalled(); expect(f.status).toHaveBeenLastCalledWith('loading');
  f.controller.configure({ ...defaults, option: {} }, false); expect(f.status).toHaveBeenLastCalledWith('empty');
  f.controller.configure({ ...defaults, option: { series: [{ type: 'unknown' }] } }, false); expect(f.status).toHaveBeenLastCalledWith('error');
  expect(f.chart.dispose).toHaveBeenCalledTimes(1); f.controller.configure(defaults, false); expect(f.status).toHaveBeenLastCalledWith('ready'); f.controller.dispose();
});
it('contains renderer init and update exceptions', () => {
  const f = fixture(); f.factory.mockImplementationOnce(() => { throw new Error('secret'); });
  f.controller.configure(defaults, false); expect(f.status).toHaveBeenLastCalledWith('error');
  f.chart.setOption.mockImplementationOnce(() => { throw new Error('secret bound data'); });
  f.controller.configure(defaults, false); expect(f.status).toHaveBeenLastCalledWith('error'); expect(f.chart.dispose).toHaveBeenCalled(); f.controller.dispose();
});
it('suppresses feedback and throttles zoom events', () => {
  const f = fixture(); f.chart.setOption.mockImplementation(() => f.handlers.get('click')?.({ name: 'feedback' }));
  f.controller.configure(defaults, false); expect(f.event).not.toHaveBeenCalled(); f.handlers.get('click')?.({ name: 'A' });
  expect(f.event).toHaveBeenLastCalledWith('onChartClick', { schemaVersion: 1, name: 'A' });
  f.handlers.get('datazoom')?.({ start: 0 }); f.handlers.get('datazoom')?.({ start: 1 }); expect(f.event).toHaveBeenCalledTimes(2);
  f.controller.configure({ ...defaults, eventsEnabled: false }, false); f.handlers.get('click')?.({}); expect(f.event).toHaveBeenCalledTimes(2); f.controller.dispose();
});
it('isolates instances and releases 50 repeated mount cycles', () => {
  const a = fixture(), b = fixture(); a.controller.configure(defaults, false); b.controller.configure(defaults, false);
  a.controller.dispose(); expect(b.chart.dispose).not.toHaveBeenCalled(); b.controller.dispose();
  for (let i = 0; i < 50; i++) { const f = fixture(); f.controller.configure(defaults, false); f.controller.dispose(); expect(f.handlers.size).toBe(0); }
});
it('gates exports and keeps data visible for merge patches', () => {
  const f = fixture(); f.controller.configure(defaults, false); expect(f.controller.exportImage()).toBeUndefined();
  f.controller.configure({ ...defaults, updateMode: 'merge', option: { title: { text: 'patch' } }, exportEnabled: true }, false);
  expect(f.status).toHaveBeenLastCalledWith('ready'); expect(f.controller.exportImage()).toContain('data:image/png'); f.controller.dispose(); expect(f.controller.exportImage()).toBeUndefined();
});
