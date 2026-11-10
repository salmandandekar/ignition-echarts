import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ configure: vi.fn(), resize: vi.fn(), dispose: vi.fn() }));
vi.mock('../echarts/ChartController', () => ({ ChartController: class { configure = mock.configure; resize = mock.resize; dispose = mock.dispose; } }));
import { ChartView } from '../components/ChartView';
import { defaults } from '../models/props';
it('disconnects observers and disposes on React unmount', () => {
  const disconnect = vi.fn(), observe = vi.fn(), remove = vi.fn();
  vi.stubGlobal('ResizeObserver', class { observe = observe; disconnect = disconnect; });
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: remove }));
  const root = document.createElement('div');
  act(() => { ReactDOM.render(<ChartView config={defaults} onEvent={vi.fn()} />, root); });
  expect(observe).toHaveBeenCalledTimes(1); expect(mock.configure).toHaveBeenCalledWith(defaults, false);
  act(() => { ReactDOM.render(<ChartView config={{ ...defaults, loading: true }} onEvent={vi.fn()} />, root); });
  expect(mock.configure).toHaveBeenCalledTimes(2); act(() => { ReactDOM.unmountComponentAtNode(root); });
  expect(disconnect).toHaveBeenCalledTimes(1); expect(remove).toHaveBeenCalledTimes(1); expect(mock.dispose).toHaveBeenCalledTimes(1); vi.unstubAllGlobals();
});
