# Performance validation

Run `cd web && CHROMIUM_PATH=/usr/bin/chromium npm run benchmark` (or omit
CHROMIUM_PATH when Playwright manages the browser). The runner starts its own
local harness and writes `benchmarks/results/standalone.json` for the current run.
This is a standalone renderer diagnostic, not an Ignition load qualification.

It measures one fresh chart mount (warm engine/cache) at 10k, 100k and 1m raw samples both with sampling
`none` and ECharts `lttb`. LTTB changes plotted resolution; all raw input still
crosses the boundary and remains in browser memory. Ten programmatic zooms record
wall time to two animation frames. These timings are not measured interaction FPS.
A 1 Hz loop sends five updates with three 10k-sample series and records visible
latency through two frames. `usedJSHeapBytes`, where supported, is only a snapshot,
not proof of no memory leak. Source sample retention checks do not establish
end-to-end no-loss delivery. Browser tests separately exercise repeated mounts.

For qualification, run at least 30 independent cold trials on documented target
hardware and browser/graphics backends. Record full distributions, p95 cold render
and zoom latency, p10 FPS from continuous rAF traces during real pointer gestures,
long tasks and heap/DOM/listener counts before/after an hour of 1 Hz updates and
repeated view navigation. Test 1, 4 and 16 charts per view, stable and changing
series, and background/foreground tabs. Preserve traces and machine/browser
versions. Do not compute tail acceptance from the diagnostic's single mount trial.

Proposed targets, still unqualified: cold render p95 <=3 s, FPS p10 >=30, zoom/pan
p95 <=200 ms, visible live-update p95 <=250 ms, no unrecovered loss, no sustained
resource growth. Downsample upstream for large live histories; do not silently
substitute downsampled results for raw-render results.

## 400-session Ignition integration plan (not executed)

1. Use a separately authorized staging Gateway running Ignition **8.3.7** and
   Perspective, a signed/trusted build, representative project and deployment
   hardware. Record Gateway CPU, JVM heap/GC, network, browser and module versions.
2. Configure a deterministic generated sequence of timestamp/value pairs in the
   project (no module database access). Bind a bounded window with a sequence ID.
3. Drive distinct real authenticated Perspective sessions from distributed load
   generators: 1, 25, 100, 200, 400 sessions, with 1 and 4 charts each. Count actual
   Gateway sessions; 400 tabs sharing a session are not 400 sessions.
4. Warm 10 minutes, sample 30 minutes, soak 4 hours. Record cold render and live
   sequence-visible timestamps, real pointer zoom latency, rAF frame intervals,
   session disconnects, missed/reordered sequence IDs, per-session WebSocket
   bytes, total network, Gateway CPU and JVM heap/GC. Synchronize clocks.
5. Test connection loss/reconnect, saved-view reload, upgrade/rollback and
   repeated navigation. Confirm recovery to the newest complete bounded snapshot.
6. Calculate p95/p10 from raw records per workload, compare proposed targets,
   retain failed trials, and report resource saturation and missing data. Stop
   load at the agreed staging resource limit. Never run this against production
   without separate authorization.

No 400-session claim or production-readiness claim is supported by local tests.
