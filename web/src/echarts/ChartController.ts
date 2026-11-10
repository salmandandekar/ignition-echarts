import { init } from './engine';
import { hasData, prepareOption, updateSettings } from './options';
import { mapEvent, type ChartEventName, type EventPayload } from '../events/payloads';
import type { ChartProps } from '../models/props';
import type { EChartsCoreOption } from 'echarts/core';
export type Status = 'ready' | 'empty' | 'loading' | 'error';
export type ChartInstance = ReturnType<typeof init>;
export type Factory = typeof init;
const eventNames = { click: 'onChartClick', datazoom: 'onDataZoom', legendselectchanged: 'onLegendSelectChanged' } as const;

/** One controller per mounted view. No streaming buffers or Gateway polling. */
export class ChartController {
  private chart?: ChartInstance;
  private config?: ChartProps;
  private dark = false;
  private destroyed = false;
  private applying = false;
  private dataPresent = false;
  private handlers: Array<[string, (event: unknown) => void]> = [];
  private lastZoom = -Infinity;
  constructor(private element: HTMLElement,
    private status: (s: Status) => void,
    private event: (name: ChartEventName, payload: EventPayload) => void,
    private factory: Factory = init) {}

  configure(config: ChartProps, dark: boolean) {
    if (this.destroyed) return;
    const previous = this.config;
    const themeChanged = previous && (previous.theme !== config.theme || (config.theme === 'auto' && dark !== this.dark));
    if (themeChanged || previous?.renderer !== config.renderer) this.release();
    this.config = config;
    this.dark = dark;
    this.update(previous);
  }
  resize() {
    if (this.destroyed) return;
    if (!this.chart) { this.update(); return; }
    try { this.chart.resize({ silent: true }); } catch { this.status('error'); }
  }
  private update(previous?: ChartProps) {
    if (this.destroyed || !this.config) return;
    const config = this.config;
    try {
      const needsOption = !this.chart || previous?.option !== config.option || previous?.updateMode !== config.updateMode;
      const option = needsOption ? prepareOption(config.option) : config.option;
      if (!this.chart) {
        if (this.element.clientWidth <= 0 || this.element.clientHeight <= 0) return;
        const theme = config.theme === 'auto' ? (this.dark ? 'dark' : undefined) : config.theme === 'dark' ? 'dark' : undefined;
        this.chart = this.factory(this.element, theme, { renderer: config.renderer });
        for (const [native, name] of Object.entries(eventNames)) {
          const handler = (input: unknown) => {
            if (this.destroyed || this.applying || !this.config?.eventsEnabled) return;
            if (native === 'datazoom') { const now = performance.now(); if (now - this.lastZoom < 100) return; this.lastZoom = now; }
            this.event(name, mapEvent(name, input));
          };
          this.handlers.push([native, handler]);
          this.chart.on(native, handler);
        }
      }
      this.applying = true;
      try { if (needsOption) this.chart.setOption(option as EChartsCoreOption, updateSettings(config.updateMode)); }
      finally { this.applying = false; }
      if (config.updateMode !== 'merge' || 'series' in option || 'dataset' in option) this.dataPresent = hasData(option);
      if (config.loading) this.chart.showLoading(); else this.chart.hideLoading();
      this.status(config.loading ? 'loading' : this.dataPresent ? 'ready' : 'empty');
    } catch {
      // Do not expose the bound option or exception text, which can contain sensitive data.
      this.release();
      this.status('error');
    }
  }
  exportImage(): string | undefined {
    if (!this.config?.exportEnabled || !this.chart || this.destroyed) return undefined;
    return this.chart.getDataURL({ type: this.config.renderer === 'svg' ? 'svg' : 'png', pixelRatio: 2, excludeComponents: ['toolbox'] });
  }
  private release() {
    const chart = this.chart;
    this.chart = undefined;
    if (chart) {
      try { for (const [name, handler] of this.handlers) chart.off(name, handler); }
      finally { chart.dispose(); }
    }
    this.handlers = [];
  }
  dispose() { this.destroyed = true; this.release(); }
}
