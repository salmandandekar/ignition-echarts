# ADR 0001: one native JSON-configured chart

Status: selected for development; Ignition integration not qualified.

Use a shared descriptor, Gateway asset hosting/registration, Designer palette
registration and a browser component with one ECharts instance per mount. The
React root uses emit() unchanged so Perspective controls layout and standard
component events. A separate ChartView/controller owns the engine and cleanup.

The strongest argument is that ordinary Perspective bindings work directly and
chart behavior remains ECharts' model. An iframe is simpler to prototype and may
be better for standalone dashboards, but adds a separate lifecycle and weakens
native property/palette integration. Separate components for every chart improve
specialized property editors but duplicate lifecycle and broaden the public API.
One component is the smallest solution for the requested scope.

Default updateMode=replace removes stale components reliably at the expense of
rebuilding the ECharts option model (not the renderer instance). Merge is better
for deliberate ID-based patches; replaceMerge replaces series/axes/dataset while
retaining unrelated settings. Document all three, keep replace safe by default.
No custom streaming protocol or appendData API until chart-specific constraints
are tested. Bounded upstream windows are simpler and recover after reconnect.

Reinitialize on theme or renderer changes because ECharts theme is an init-time
setting. Observe container dimensions; wait for positive dimensions. Dispose
listeners and instance, disconnect observer/media listener on unmount. No timer
or asynchronous update queue is required. Use tests to challenge these choices.
