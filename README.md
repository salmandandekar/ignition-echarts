# ignition-echarts

An independent, open-source Apache ECharts component for Ignition Perspective.
Build interactive charts, real-time trends and industrial data visualizations
through ordinary Perspective JSON bindings. Apache License 2.0. Not an official
Inductive Automation or Apache Software Foundation product.

**Development status: pre-MVP integration build.** The frontend renders and has
local automated tests; **SDK compilation, a `.modl` artifact and installation on
Ignition have not been verified** because this environment denies access to
Inductive Automation's Nexus registry. Do not treat this as a production release
or a completed Phase 1. Target: Ignition **8.3.7**, intended minimum family 8.3.
No support claim for 8.1, Edge, Maker or Cloud editions.

## What is implemented

- One native component, `community.echarts.chart`, with a bindable `option` object.
- Common descriptor/schema and Gateway/Designer registration source.
- Locally bundled ECharts 6.1.0; Perspective supplies React. No CDN, database,
  additional application server or paid service for basic rendering.
- Line, area, bar, pie, scatter, time-series, heatmap, gauge, candlestick and mixed
  chart configurations; Canvas and SVG renderers.
- Stable chart lifecycle, resize handling, light/dark/OS-auto theme, loading/error
  states, bounded click/zoom/legend event payloads and image downloads.
- Frontend tests, real-browser harness, benchmark diagnostics, CI and release gates.

See [requirement coverage](docs/REQUIREMENTS.md), [build/test evidence](docs/BUILD_EVIDENCE.md)
and [known risks](docs/RED_TEAM.md). The native registration source must compile
and pass a real Gateway test before the module can be described as functional.

## Development quick start

Use Node 24.22.1, npm 11.9.0 and JDK 21. Java source targets Java 17 bytecode.
The checked-in Gradle 8.14.3 wrapper verifies the distribution SHA256.

```sh
cd ignition-echarts
npm --prefix web ci
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web test
npm --prefix web run build
npm --prefix web run licenses
npm --prefix web run dev
```

The standalone harness demonstrates actual renderer behavior but does not emulate
a licensed Gateway or Designer. For browser tests install Playwright Chromium
(`cd web && npx playwright install chromium`) then `npm run test:browser`, or set
`CHROMIUM_PATH=/usr/bin/chromium` to use an installed Chromium.

```sh
./gradlew --no-daemon :common:compileJava :gateway:compileJava :designer:compileJava zipModule
python3 scripts/validate-artifact.py
```

Gradle requires `plugins.gradle.org`, its artifact hosts, Maven Central and
`nexus.inductiveautomation.com`. Under the managed cloud proxy run
`python3 scripts/gradle-cloud.py` with those same arguments. It configures Java's
proxy host/port without copying credentials or weakening TLS. For reusable cloud
setup see [environment instructions](docs/ENVIRONMENT_SETUP.md).

## Installation and first chart

After a successful qualified build, follow [installation/signing](docs/INSTALLATION.md).
No release artifact was published by this task. In a validated installation:
find **Charts > ECharts**, drag onto a Perspective view, and edit `props.option`:

```json
{
  "title": {"text": "Production"},
  "tooltip": {"trigger": "axis"},
  "xAxis": {"type": "category", "data": ["Mon", "Tue", "Wed"]},
  "yAxis": {"type": "value"},
  "series": [{"id": "output", "name": "Output", "type": "line", "data": [12, 20, 15]}]
}
```

[Working example configurations](examples/) and the standalone harness are
included. [Binding guide](docs/DATA_BINDING.md) covers static values, named
queries/SQL results, tag values, tag history and script transforms. Bind data in
the project; this module has no database client or credentials.

## Properties and events (schema v1)

| Property | Default | Behavior |
|---|---|---|
| `option` | Example line chart | JSON ECharts options for registered features |
| `updateMode` | `replace` | `notMerge:true`; reliably removes stale series/axes |
| `updateMode=merge` | opt-in | Normal ECharts merge; use stable IDs, omitted components remain |
| `updateMode=replaceMerge` | opt-in | Replace series/xAxis/yAxis/dataset, merge other settings |
| `renderer` | `canvas` | `svg` alternative; changing renderer reinitializes the chart |
| `theme` | `light` | `dark` or `auto` using OS color preference, not Perspective theme detection |
| `loading` | `false` | Loading overlay |
| `emptyText` | `No data` | Empty snapshot status text |
| `accessibleLabel` | Reminder to supply equivalent table | Set a meaningful description and provide a bound Perspective Table |
| `exportEnabled` | `false` | User-triggered PNG (Canvas) or SVG download; no CSV/data export |
| `eventsEnabled` | `true` | Enable bounded chart event forwarding |
| `style` | normal Perspective style | Layout is supplied through Perspective emit() |

`onChartClick` includes schemaVersion 1 and available component/series type,
series index/name, data index/name and scalar or short array value.
`onDataZoom` includes start/end, optional value range/ID or up to 16 batch entries,
limited to 10 events/second (intermediate zoom events can be dropped).
`onLegendSelectChanged` includes name and up to 128 selected booleans.
Strings are truncated to 1024 characters, value arrays to 16 entries. DOM events and
raw data records are omitted. See [event schemas](common/src/main/resources/events/).
Actual Gateway event scripts remain unverified. Programmatic option updates are
silent to reduce feedback; project event scripts must avoid their own loops.

## Limitations and release gates

Only registered chart/components are supported; no map/GL/custom plugins, arbitrary
JavaScript callbacks or executable strings. ECharts template formatters work.
Tooltips always use richText; HTML DataView toolbox, external images and navigation
links are disabled. There is no full ECharts JSON schema duplication. Limits are
5 million JSON nodes, depth 64 and 16KiB per string, evaluated once per update.
This does not guarantee large datasets fit a particular browser. Use bounded,
upstream-aggregated windows; no appendData interface is exposed.

Empty-state detection targets ordinary series.data/dataset.source snapshots;
timeline/media-only and transformed-dataset-only options are not qualified.
Theme/renderer changes reset interactions; full replacement can reset model state.
Canvas charts do not supply complete keyboard navigation or tabular access. No
WCAG compliance or 400-session support claim is made. See [benchmarks](benchmarks/README.md).

Saved-view ID/property compatibility must be preserved in future releases;
breaking changes require migration notes and upgrade/rollback tests. The current
build uses official module tooling with signing skipped for **development only**.
Public releases require trusted signatures, SDK/license review, Gateway/Designer
acceptance, target browser testing and signed artifact/checksum validation.

## Community

Read [CONTRIBUTING](CONTRIBUTING.md), [SECURITY](SECURITY.md), [CHANGELOG](CHANGELOG.md),
[reference analysis](docs/REFERENCE_ANALYSIS.md) and [ADRs](docs/adr/).
Use [issues](https://github.com/salmandandekar/ignition-echarts/issues) for public
bugs/features and [pull requests](https://github.com/salmandandekar/ignition-echarts/pulls)
for reviewed changes. Private vulnerabilities follow SECURITY, not public issues.
See [LICENSE](LICENSE) and [NOTICE](NOTICE); generated runtime license texts are
packaged with the Gateway assets. Ignition SDK artifacts are compile-only.
