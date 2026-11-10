import * as React from 'react';
import { ChartView } from './components/ChartView';
import { defaults, type ChartProps } from './models/props';
import type { ChartEventName, EventPayload } from './events/payloads';
import './style.css';

export const COMPONENT_TYPE = 'community.echarts.chart';
/** Narrow structural boundary, sourced from the official minimal example and EMBr.
 * This is not a substitute for SDK package type checking or Gateway validation.
 */
interface Tree { read<T>(path: string, fallback: T): T }
interface PerspectiveProps {
  props: ChartProps;
  emit(): React.HTMLAttributes<HTMLDivElement>;
  componentEvents: { fireComponentEvent(name: string, payload: EventPayload): void };
}
interface Runtime {
  Component: typeof React.Component;
  ComponentRegistry: { register(meta: EChartsMeta): void };
}
declare global { interface Window { PerspectiveClient: Runtime } }
const runtime = window.PerspectiveClient;
export class ECharts extends runtime.Component<PerspectiveProps> {
  private send = (name: ChartEventName, payload: EventPayload) => this.props.componentEvents.fireComponentEvent(name, payload);
  render() {
    return <div {...this.props.emit()}><ChartView config={this.props.props} onEvent={this.send} /></div>;
  }
}
export class EChartsMeta {
  getComponentType() { return COMPONENT_TYPE; }
  getViewComponent() { return ECharts; }
  getDefaultSize() { return { width: 640, height: 360 }; }
  getPropsReducer(tree: Tree): ChartProps {
    return {
      option: tree.read('option', defaults.option), updateMode: tree.read('updateMode', defaults.updateMode),
      theme: tree.read('theme', defaults.theme), renderer: tree.read('renderer', defaults.renderer),
      loading: tree.read('loading', defaults.loading), accessibleLabel: tree.read('accessibleLabel', defaults.accessibleLabel),
      emptyText: tree.read('emptyText', defaults.emptyText), exportEnabled: tree.read('exportEnabled', defaults.exportEnabled),
      eventsEnabled: tree.read('eventsEnabled', defaults.eventsEnabled),
    };
  }
}
runtime.ComponentRegistry.register(new EChartsMeta());
