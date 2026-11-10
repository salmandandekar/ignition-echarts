import * as React from 'react';
import { ChartController, type Status } from '../echarts/ChartController';
import type { ChartProps } from '../models/props';
import type { ChartEventName, EventPayload } from '../events/payloads';
export interface ChartViewProps { config: ChartProps; onEvent: (name: ChartEventName, payload: EventPayload) => void }
export function ChartView({ config, onEvent }: ChartViewProps) {
  const target = React.useRef<HTMLDivElement>(null);
  const controller = React.useRef<ChartController>();
  const latestEvent = React.useRef(onEvent);
  latestEvent.current = onEvent;
  const [status, setStatus] = React.useState<Status>('empty');
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const change = () => setDark(media.matches);
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  React.useEffect(() => {
    const element = target.current;
    if (!element) return;
    let active = true;
    const instance = new ChartController(element, s => { if (active) setStatus(s); }, (name, payload) => latestEvent.current(name, payload));
    controller.current = instance;
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(element);
    return () => { active = false; observer.disconnect(); instance.dispose(); controller.current = undefined; };
  }, []);
  React.useEffect(() => { controller.current?.configure(config, dark); }, [config, dark]);
  function download() {
    try {
      const url = controller.current?.exportImage();
      if (url) { const a = document.createElement('a'); a.href = url; a.download = config.renderer === 'svg' ? 'chart.svg' : 'chart.png'; a.click(); }
    } catch { setStatus('error'); }
  }
  return <div className="ie-chart" data-status={status}>
    <div className="ie-chart-surface" ref={target} role="img" aria-label={config.accessibleLabel} />
    {status !== 'ready' && <div className="ie-chart-status" role="status" aria-live="polite">{status === 'error' ? 'Unable to render chart. Check the option configuration.' : status === 'loading' ? 'Loading chart' : config.emptyText}</div>}
    {config.exportEnabled && status === 'ready' && <button className="ie-chart-export" type="button" onClick={download} aria-label="Download chart image">Save image</button>}
  </div>;
}
