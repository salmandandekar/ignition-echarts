import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChartView } from './components/ChartView';
import { defaults, type ChartProps, type Option } from './models/props';
import type { ChartEventName, EventPayload } from './events/payloads';
import { getInstanceByDom } from 'echarts/core';
import './style.css';
const root = document.getElementById('root')!;
let current = defaults;
const events: Array<{ name: ChartEventName; payload: EventPayload }> = [];
function render(patch: Partial<ChartProps> = {}) {
  current = { ...current, ...patch };
  ReactDOM.render(<ChartView config={current} onEvent={(name, payload) => events.push({ name, payload })} />, root);
}
export const harness = {
  render,
  renderMany(options: Option[]) {
    ReactDOM.render(<>{options.map((option, i) => <div key={i} style={{ width: 380, height: 250, display: 'inline-block' }}><ChartView config={{ ...defaults, option }} onEvent={(name, payload) => events.push({ name, payload })} /></div>)}</>, root);
  },
  instances: () => Array.from(root.querySelectorAll('.ie-chart-surface')).map(node => getInstanceByDom(node as HTMLElement)),
  unmount: () => ReactDOM.unmountComponentAtNode(root), events,
  instance: () => { const node = root.querySelector('.ie-chart-surface'); return node ? getInstanceByDom(node as HTMLElement) : undefined; },
};
declare global { interface Window { harness: typeof harness } }
window.harness = harness;
render();
