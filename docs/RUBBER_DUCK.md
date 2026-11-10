# Rubber-duck implementation notes

## Native registration and packaging

The component must appear in Designer and resolve the same ID in a browser.
Data: shared JSON schema -> property tree -> reducer -> ChartProps -> ECharts.
Dependencies: real SDK descriptors/registries, Gateway module resource mounting,
Gradle module plugin, host React/Perspective globals. Startup registers descriptors;
shutdown removes them. A missing registry fails startup visibly. Keep generated
web assets in the Gateway JAR; no extra web subproject or server is needed.
Executable acceptance: compile hooks and zipModule, then validate the actual zip;
manual palette drag/binding/session tests on 8.3.7. Compilation is blocked before
source compilation by Nexus 403; acceptance is explicitly pending.

## Lifecycle and option updates

One mounted view owns one controller. A positive-size DOM container initializes
it. Props become validated options and a silent setOption; normal updates keep
the instance. ResizeObserver resizes or initializes a formerly hidden chart.
Themes/renderers recreate the instance, releasing handlers first. Unmount
disconnects observers and disposes. No streaming timer, worker, pending network
operation or duplicate history buffer is necessary. Failures release partially
initialized resources and show a generic error without logging bound data. A
valid subsequent option retries initialization. Tests exercise 20 updates, 50
controller mount cycles, React cleanup and actual browser mount cycles.

## Security, events, and data

The option is JSON, so callbacks cannot be transported. ECharts template strings
are sufficient for basic formatting; avoid a homegrown expression interpreter.
RichText prevents HTML tooltip interpretation. Source review found toolbox
DataView uses innerHTML, so it is rejected too. External image resources and
links add unnecessary network/security scope and are disabled. A single bounded
scan validates JSON, reuses raw data arrays and copies only safety overrides.
Five million nodes, depth 64 and 16 KiB strings are explicit limits, not a guarantee
that million-point rendering is fast or memory-safe on every client.

Native chart events map to short versioned payloads -> Perspective component
Events. Do not send DOM objects or arbitrary data records; dataIndex allows a
script to look up its own data. Silent updates plus an applying guard prevent
synchronous feedback, and zoom is limited to 10 events/sec. No trailing timer or
queue simplifies cleanup. Acceptance: mapping/feedback tests plus real chart click;
Gateway script invocation remains a separate test.

## Empty states, export and performance

Empty means no series.data or dataset.source entries in ordinary snapshots;
merge-only layout patches retain the prior known data state. Timeline/media-only
options and built-in transformed datasets need more sophisticated empty inference
and are not qualified. Loading is explicit. Image export is local getDataURL and
a user-triggered download; no CSV claim. Renderer/browser graphics failures are
contained. Tests assert export filename and chart state. Benchmark diagnostics
separate raw and LTTB paths, record actual outputs and avoid extrapolation from
one browser to 400 Gateway sessions. Equivalent Perspective tables remain the
accessible data path; no WCAG claim.
