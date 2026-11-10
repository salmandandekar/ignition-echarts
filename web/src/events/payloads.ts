import type { Json } from '../models/props';
export type ChartEventName = 'onChartClick' | 'onDataZoom' | 'onLegendSelectChanged';
export type EventPayload = Record<string, Json>;
const scalar = (v: unknown): Json => typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' ? v.slice(0, 1024) : typeof v === 'boolean' ? v : null;
function value(v: unknown): Json { return Array.isArray(v) ? v.slice(0, 16).map(scalar) : scalar(v); }
export function mapEvent(name: ChartEventName, input: unknown): EventPayload {
  const p = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const result: EventPayload = { schemaVersion: 1 };
  const keys = name === 'onChartClick'
    ? ['componentType', 'seriesType', 'seriesIndex', 'seriesName', 'name', 'dataIndex', 'value']
    : name === 'onLegendSelectChanged' ? ['name'] : ['start', 'end', 'startValue', 'endValue', 'dataZoomId'];
  for (const key of keys) if (p[key] !== undefined) result[key] = value(p[key]);
  if (name === 'onDataZoom' && Array.isArray(p.batch)) result.batch = p.batch.slice(0, 16).map(item => mapEvent(name, item));
  if (name === 'onLegendSelectChanged' && p.selected && typeof p.selected === 'object') {
    const selected: Record<string, Json> = Object.create(null) as Record<string, Json>;
    for (const [k, v] of Object.entries(p.selected).slice(0, 128)) if (typeof v === 'boolean') selected[k.slice(0, 1024)] = v;
    result.selected = selected;
  }
  return result;
}
