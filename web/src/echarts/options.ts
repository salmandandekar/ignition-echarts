import type { Json, Option, UpdateMode } from '../models/props';
const types = new Set(['line', 'bar', 'pie', 'scatter', 'heatmap', 'gauge', 'candlestick']);
const forbidden = new Set(['__proto__', 'constructor', 'prototype']);

/** Scan once per option update. Copy only changed tooltip branches, retaining dataset arrays. */
export function prepareOption(input: unknown): Option {
  let nodes = 0;
  function visit(value: unknown, depth: number, key = ''): Json {
    if (++nodes > 5_000_000 || depth > 64) throw new Error('Option exceeds safety limits');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      if (value.length > 16384 || value.startsWith('image://')) throw new Error('Unsupported image or oversized string');
      if (['image', 'link', 'sublink'].includes(key) && value) throw new Error('External images and navigation links are disabled');
      return value;
    }
    if (typeof value !== 'object' || value === null) throw new Error('Options must contain finite JSON values only');
    if (Array.isArray(value)) {
      let result = value as Json[];
      value.forEach((v, i) => { const next = visit(v, depth + 1, key); if (next !== v) { if (result === value) result = value.slice() as Json[]; result[i] = next; } });
      return result;
    }
    if (![Object.prototype, null].includes(Object.getPrototypeOf(value) as object | null)) throw new Error('Options must be plain JSON');
    const object = value as Option;
    let result = object;
    for (const k of Object.keys(object)) {
      if (forbidden.has(k)) throw new Error('Unsafe option key');
      if (k === 'dataView') throw new Error('HTML data-view toolbox is disabled; use a Perspective table');
      const next = visit(object[k], depth + 1, k);
      if (next !== object[k]) { if (result === object) result = { ...object }; result[k] = next; }
    }
    if (key === 'tooltip') result = { ...result, renderMode: 'richText', confine: true };
    return result;
  }
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('option must be a JSON object');
  const option = visit(input, 0) as Option;
  const series = option.series ? (Array.isArray(option.series) ? option.series : [option.series]) : [];
  for (const item of series) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid series');
    if (item.type !== undefined && (typeof item.type !== 'string' || !types.has(item.type))) throw new Error('Chart type is not registered');
  }
  const tooltip = option.tooltip;
  return { ...option, tooltip: tooltip ?? { renderMode: 'richText', confine: true } };
}
export function updateSettings(mode: UpdateMode) {
  return {
    notMerge: mode === 'replace', silent: true, lazyUpdate: false,
    ...(mode === 'replaceMerge' ? { replaceMerge: ['series', 'xAxis', 'yAxis', 'dataset'] } : {}),
  };
}
export function hasData(option: Option): boolean {
  const list = (v: Json | undefined) => Array.isArray(v) ? v : v ? [v] : [];
  const datasets = list(option.dataset);
  if (datasets.some(d => d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.source) && d.source.length > 0)) return true;
  return list(option.series).some(s => s && typeof s === 'object' && !Array.isArray(s) && Array.isArray(s.data) && s.data.length > 0);
}
