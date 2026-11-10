export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type Option = { [key: string]: Json };
export type UpdateMode = 'replace' | 'merge' | 'replaceMerge';
export type Theme = 'light' | 'dark' | 'auto';
export type Renderer = 'canvas' | 'svg';
export interface ChartProps {
  option: Option;
  updateMode: UpdateMode;
  theme: Theme;
  renderer: Renderer;
  loading: boolean;
  accessibleLabel: string;
  emptyText: string;
  exportEnabled: boolean;
  eventsEnabled: boolean;
}
export const defaultOption: Option = {
  title: { text: 'ECharts' }, tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['A', 'B', 'C'] }, yAxis: { type: 'value' },
  series: [{ id: 'values', name: 'Values', type: 'line', data: [12, 20, 15] }],
};
export const defaults: ChartProps = {
  option: defaultOption, updateMode: 'replace', theme: 'light', renderer: 'canvas',
  loading: false, accessibleLabel: 'Chart. Provide equivalent data in a table.',
  emptyText: 'No data', exportEnabled: false, eventsEnabled: true,
};
