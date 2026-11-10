# Requirements and test traceability

Status vocabulary: **verified** means only the explicitly named local capability;
**partial** means implementation exists but a requirement or integration check is
missing; **unverified** means written but not executed against its actual target;
**blocked** identifies a failed external prerequisite. No row establishes Gateway
installation or a completed Phase 1. Target 8.3.7; 8.3 family compatibility is an
intention, not a validated range. Schema/event payload version 1.

| ID | Requirement | Coverage | Evidence / remaining acceptance |
|---|---|---|---|
| FR-001 | Native component, palette, bindings, layout, instances | Partial; SDK build blocked | Common/Gateway/Designer hooks, native browser reducer/emit; structural UMD fixture; actual palette/Designer/session pending |
| FR-002 | Bindable JSON option | Partial | Option schema, safety tests, browser rendering; actual Perspective binding pending. JSON template strings only, no callbacks; constrained resource/HTML options |
| FR-003 | Core charts | Implemented and verified standalone | Browser exercises line, area, bar, pie, scatter, time, heatmap, gauge, candlestick and mixed in Canvas/SVG; Gateway rendering unverified |
| FR-004 | Lifecycle | Implemented and verified standalone | Controller and React cleanup tests, repeated real-browser mount/unmount, resize and delayed zero-size init; Gateway navigation pending |
| FR-005 | Update semantics | Implemented and verified standalone | Explicit replace/merge/replaceMerge settings; repeated update instance identity and stale-series replacement tests; saved-view integration pending |
| FR-006 | Appearance/themes | Partial | Light/dark/OS-auto implementation and theme reinit tests, Canvas/SVG; Perspective theme detection not implemented |
| FR-007 | Click/zoom/legend component events | Partial | Payload/feedback/throttling tests, real-browser click; Java event descriptors and bridge written, Gateway event scripts unverified |
| FR-008 | Perspective data bindings | Partial | Dataset example and binding transforms documented, no direct DB code; actual named query/tag/history binding pending |
| FR-009 | Empty/loading/error | Implemented and verified standalone | Unit failures/recovery/loading and browser invalid->empty->ready; timeline/transformed-dataset-only empty inference not qualified |
| FR-010 | Image export | Implemented and verified standalone | getDataURL and browser PNG download; actual SVG document download verified; CSV not implemented |
| NFR-001 | Modular architecture | Implemented; integration unverified | Separate scopes, schema, adapter, events, controller/view, tests and ADRs |
| NFR-002 | Browser performance | Partial | Registered subset, array reuse, stable instance, bounded input; diagnostic benchmark; qualification thresholds remain unverified |
| NFR-003 | Resource cleanup | Partial | Observer/media cleanup and repeated lifecycle tests; long-duration heap/listener endurance unrun |
| NFR-004 | Security | Partial | JSON-only, richText, DataView/images/links blocked, bounded events, local assets; unit/browser checks; real Gateway auth and independent security review pending |
| NFR-005 | Dependencies/licensing | Partial | Exact direct pins, npm lock/integrity and zero-vulnerability scan at validation time, generated runtime licenses/notices; SDK terms/wrapper provenance and Java dependency scan pending |
| NFR-006 | Compatibility | Partial | Stable identifiers, schema version 1, changelog and migration policy; saved-project upgrade/rollback tests unrun |
| NFR-007 | Accessibility | Partial | Accessible label, status announcements, focusable export, equivalent-table guidance; chart keyboard navigation and assistive-technology review incomplete; no WCAG claim |
| PERF-001 | 10k/100k/1m raw and sampled | Diagnostic harness implemented | Single-browser results are not load qualification; see benchmarks/results and BUILD_EVIDENCE |
| PERF-002 | 1 Hz, multiple series/charts, repeated mounts | Partial | Three-series diagnostic, repeated mounts; multi-chart and endurance qualification plan, no sustained-growth claim |
| PERF-003 | 400 concurrent sessions | Not executed | Separate staging integration plan in benchmarks/README.md; optional for first development build |
| REL-001 | Installable module | Blocked | Official zipModule attempted; Nexus 403 prevents module-signer resolution; no .modl produced |
| REL-002 | Community release | Partial | CI/docs/license/security/contribution files; signing, full SDK/Gateway validation and release gates pending |

Automated tests live in `web/src/tests` and `web/browser/chart.spec.ts`.
`scripts/check-contract.mjs` checks ID/property/event consistency, not SDK behavior.
`scripts/validate-artifact.py` must run on a real Gradle output, never a fabricated zip.
