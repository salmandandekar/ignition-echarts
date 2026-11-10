import { init, use } from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart, HeatmapChart, GaugeChart, CandlestickChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent, LegendComponent, DatasetComponent, TransformComponent, DataZoomComponent, VisualMapComponent, AriaComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
use([LineChart, BarChart, PieChart, ScatterChart, HeatmapChart, GaugeChart, CandlestickChart,
  GridComponent, TitleComponent, TooltipComponent, LegendComponent, DatasetComponent,
  TransformComponent, DataZoomComponent, VisualMapComponent, AriaComponent, ToolboxComponent,
  CanvasRenderer, SVGRenderer]);
export { init };
export type { EChartsType } from 'echarts/core';
