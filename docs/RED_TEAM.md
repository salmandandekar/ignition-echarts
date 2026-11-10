# Red-team review

Critical findings block release. **Phase 1 is not complete**: a real Gateway was
not supplied and SDK build dependencies are denied by network policy.

| Scenario | Severity / failure mechanism and impact | Mitigation and verification test | Actual result / residual risk |
|---|---|---|---|
| RT-001 Designer works, browser fails | High: different asset/runtime globals break sessions | Local UMD with host externals; structural bundle test plus manual Designer/session acceptance | Structural fixture tested; real runtime unverified; release blocker |
| RT-002 Restart needed | Medium: registry/classloader state persists on update | Document supported Gateway restart and fresh Designer/browser; install/restart test | Not executed; schedule staging test |
| RT-003 Saved view upgrade breaks | High: ID/schema changes invalidate saved views | Stable ID/schema v1, avoid property removal; export project then upgrade/rollback | Not executed; release blocker |
| RT-004 Rapid option updates recreate instance | Medium: expensive init and lost zoom state | Keep instance; explicit setOption semantics; repeated-update identity test | Unit verified; merge is opt-in and default replacement resets model interaction state |
| RT-005 Destroy during update | Medium: disposed DOM access or late setState | Synchronous update, destroyed/applying guards; React active flag; cleanup test | Unit and browser cycles tested; asynchronous engine internals not exhaustively fault-injected |
| RT-006 Binding feedback loop | High: event-driven updates saturate Gateway | silent setOption, applying guard, zoom max 10/sec, eventsEnabled; feedback test | Local verified; user event scripts can still create server-side cycles; integration pending |
| RT-007 Invalid option exception | Medium: session error or leaked chart | JSON validation, try/catch and release/recovery state; invalid/init/update tests | Local verified; async graphics errors still require target-browser testing |
| RT-008 Tooltip XSS | High: HTML formatter/data-view injection | Force recursive richText, prohibit executable values, DataView toolbox, image resources and links; malicious option tests | Local tooltip mode and absence of injected DOM tested; independent security review pending |
| RT-009 Million-point memory exhaustion | High: browser allocation/GC failure | Explicit structural limits, no duplicate adapter dataset buffer, upstream windows/LTTB; raw-vs-sampled benchmark | Single-browser diagnostic only; budgets/endurance unqualified. Downsampling does not remove raw memory/transfer costs |
| RT-010 400 sessions resend properties | High: Gateway/websocket saturation | No high-rate event payloads, bounded source windows, upstream aggregation; 400-session plan | Unrun; no scale claim |
| RT-011 Multiple charts leak resources | Medium: listeners/observers/renderer retention | Per-instance ownership, off/dispose/disconnect; 50 controller and browser mount cycles | Local verified, including two real browser chart instances; long soak/heap trend unrun |
| RT-012 React conflicts | High: duplicate runtime breaks hooks | React/ReactDOM externals, official window runtime pattern; production UMD test | Local host-React fixture verified; actual Perspective runtime/type package pending |
| RT-013 Unexpected CDN/network assets | Medium: offline failure or data exposure | Bundle ECharts; deny image/link resource configurations; observe bundle fixture requests | Local fixture has no external requests; broad option corpus still needs audit |
| RT-014 Changed SDK APIs | High: build/install failure | Official 8.3 patterns and pinned SDK 8.3.7; compile hooks and read upgrade guide | BLOCKED: Nexus/docs host 403; no compile claim. Must read guide and compile before release |
| RT-015 Incomplete artifact | High: CI passes without browser/schema resources | zipModule must succeed; validate real zip contents/ID/jars/assets; fail on absent artifact | Validator fails correctly because artifact absent. Actual packaged SDK integration unverified |
| RT-016 Unsigned represented as distributable | High: unsafe trust/deployment expectations | Artifact suffix unsigned.modl; no release publishing; signing/trust guide | No module artifact and no signature produced; release blocked |
| RT-017 Different graphics backends | Medium: renderer-specific issues | Canvas and SVG browser cases, error containment; Linux/Windows target browser matrix | Headless Linux Chromium tested; Windows/browser/driver matrix unrun |
| RT-018 Function options cannot serialize | Medium: formatter config silently wrong | Reject functions/nonfinite values; document template strings/upstream transforms | Unit verified; no function recreation or script interpreter |
| RT-019 Zero dimensions | Medium: unusable init and resizing | Delay init until positive width/height; ResizeObserver | Unit zero-size and browser resize verified; complex Perspective layouts pending |
| RT-020 Missed attribution | Medium: redistribution obligations | Existing Apache license retained, NOTICE and runtime license collector; source provenance review | Runtime notices generated; SDK terms/wrapper provenance final legal/release review pending |

No known unresolved **Critical** code finding was established by the checks run.
That does not establish a security certification. Unverified High integration,
upgrade and scaling risks above block a production-readiness claim.

## Additional findings

- **Medium, development tooling:** initial scan found critical/high tool advisories;
  update Vite/Vitest/ESLint/typescript-eslint and apply tested minimatch11.0.1
  override for GHSA-g3hv-75wg-m249. Final scan must pass; no disabling audit.
- **Medium, host contract:** narrow structural runtime types do not detect all SDK
  drift. Replace/validate them against official npm types when Nexus works.
- **Low, empty inference:** timeline/media-only data and transformed datasets may
  display an empty overlay despite rendering. Ordinary series/data and dataset
  source snapshots are the documented qualified input forms.
- **Medium, accessibility:** visual chart keyboard interaction is incomplete;
  provide a bound Perspective Table and meaningful description. Do not claim WCAG.
