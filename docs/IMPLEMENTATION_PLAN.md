# Phased implementation and remaining work

## Phase 0 — discovery

Repository was license-only and clean. Read official 8.3 full/minimal example
source, EMBr charts and ECharts 6.1.0 implementation/types. Capture decisions,
requirements and threat review. Official SDK docs/upgrade guide are blocked by
host policy; completing that research is required before integration qualification.

## Phase 1 — development implementation

Native source, browser renderer, schema, events, examples, tests and CI are written.
Standalone checks execute real ECharts. SDK build is blocked before Java source
compilation; no module artifact or Gateway is available. **Phase 1 is incomplete.**
Next: enable Nexus/docs access, compile all scopes, fix any verified API mismatch,
validate official artifact, then run the full staging installation checklist.
No phase completion is inferred from frontend tests.

## Phase2 — after Phase 1 passes

Qualify additional events/image export on Gateway, query/tag/history bindings,
real-time upstream windows, Perspective theme integration, keyboard/data-table
accessibility, multi-chart endurance and browser performance. Advanced renderer
examples are already explored locally, without calling Phase2 complete.

## Phase3 — community release

Require trusted signing, final SDK/dependency/license review, Windows/Linux and
browser matrix, migration/rollback tests, full CI evidence, qualified performance
results and community release notes/checksums.400-session testing is a separate
staging exercise, not a prerequisite for the first functional build. Never label
this production-ready before the gates pass.
