# Build and test evidence — 2026-11-10

Actual cloud instance: `/workspace/ignition-echarts`, clean initial commit
`2b09c6c5febb7d5886b84435f7cd22f29a44418e`. Original LICENSE preserved. Validation was performed before the initial
implementation commit. No GitHub Release, Gateway deployment or environment
publication occurred during validation.

## Commands and outcomes

Commands below are relative to the repository unless the directory is specified.
Npm commands used an explicit writable cache (`--cache /tmp/npm-cache`).

| Command / working directory | Exit | Observed result |
|---|---:|---|
| `git ls-remote origin HEAD` | 0 | Existing platform Git read authentication works |
| Clone official ignition-8.3 SDK examples, EMBr and ECharts 6.1.0 to /tmp | 0 | Source revisions in REFERENCE_ANALYSIS |
| `npm install --no-fund --no-audit` / web | 0 | Initial dependency installation; later updated vulnerable tooling and lockfile |
| `npm ci --no-fund` / web | 0 | Repeated install from committed-intent lockfile; 197 packages installed, zero vulnerabilities reported |
| `npm run lint` / web | 0 | ESLint passes, including minimatch 11.0.1 security override |
| `npm run typecheck` / web | 0 | Strict TypeScript passes; structural Perspective boundary, not official SDK type validation |
| `npm test` / web | 0 |27 tests passed in 3 files, no skipped tests |
| `npm run build` / web | 0 | Vite 7.3.8 UMD bundle,594 modules; JS766.56kB (gzip259.56kB), CSS0.42kB |
| `npm run licenses` / web | 0 | ECharts 6.1.0, zrender 6.1.0 and tslib 2.3.0 license/notice text generated |
| `npm audit --audit-level=moderate` / web | 0 | Zero reported vulnerabilities at execution time, including dev dependencies |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` / web | 0 | 7 Playwright tests passed in 14.0s, no skipped tests |
| `CHROMIUM_PATH=/usr/bin/chromium npm run benchmark` / web | 0 | 1 diagnostic test passed in 56.7s; six sample-count/sampling scenarios plus 1 Hz updates |
| `node scripts/check-contract.mjs` | 0 | Schema properties, IDs, event names and example JSON consistency; not an SDK test |
| `python3 scripts/gradle-cloud.py --no-daemon --console=plain :common:compileJava :gateway:compileJava :designer:compileJava zipModule` | 1 | Blocked during classpath resolution: module-signer 0.0.1.ia Nexus POM returns403. Java compilation and zip task did not execute |
| `python3 scripts/validate-artifact.py` | 1 | Correctly rejects absent `build/IgnitionECharts-0.1.0-dev.1.unsigned.modl`; no artifact was fabricated |
| `git diff --check` | 0 | No whitespace errors in tracked diff; new files reviewed separately |

The final focused browser run additionally verified two real independent chart
instances preserve their IDs across updates and exported SVG bytes contain an SVG
document. See `docs/evidence/frontend.txt`, `docs/evidence/browser.txt`, and
`docs/evidence/gradle-blocked.txt` for captured command output.

Artifacts present: `web/dist/IgnitionECharts.js`, `web/dist/IgnitionECharts.css`,
`web/build/THIRD_PARTY_NOTICES.txt` (generated/ignored), and
`benchmarks/results/standalone.json` (retained evidence).
The browser runner writes temporary screenshots under web/test-results; subsequent
runs replace that directory. No `.modl` or signed artifact exists.

## Earlier failures and corrections

- Initial npm cache path was unwritable: use /tmp or /workspace cache.
- Initial Gradle invocation lacked Java proxy properties and could not resolve the
  plugin. The helper fixed that; the remaining failure is an explicit Nexus 403.
- Initial unit-test file creation used the wrong directory; runner rejected zero
  tests. Paths were corrected and all 27 intended tests executed successfully.
- Initial audit:11 advisories including critical Vitest/high Vite. Updated pinned
  tooling; the remaining minimatch advisory required a tested 11.0.1 override.
  Final full audit returned zero. Nothing was suppressed.
- License collector initially used package.json exports unavailable in tslib;
  resolve package root from its entry point and collect actual license files.
- First browser run: 4 passed, 1 failed because ECharts created multiple valid
  Canvas layers and the test used a strict singleton selector. Corrected selector,
  added stale-series removal assertion, reran: 5 passed.
- First benchmark runner was interrupted by a concurrent npm ci started by the
  agent. Serialize dependency mutation and tests; standalone rerun passed.

## Standalone performance observations (not acceptance qualification)

Chromium 156, Linux, one headless browser; one fresh chart mount per scenario,
warm engine/cache, no Ignition Gateway. Exact records and browser string are in
benchmarks/results/standalone.json. No p95/p10 or 400-session result is inferred.

| Samples | Raw initial mount | LTTB initial mount |
|---:|---:|---:|
|10,000 |91.4ms |51.0ms |
|100,000 |233.7ms |109.7ms |
|1,000,000 |3234.5ms |6090.4ms |

Million-sample raw programmatic zoom-to-two-frame measurements ranged roughly
1.32–3.51s; LTTB ranged 49.6–110ms in this run. The two million-sample initial
mounts exceeded the proposed 3s engineering target. Three-series 10k-sample 1 Hz
visible-update observations were 507.8,109.2,75.2,164.7,61.5ms; one exceeded 250ms.
These are diagnostic observations, not statistically qualified thresholds.
Heap snapshots for the sequential million-sample scenarios were approximately
450 MB and 860 MB; prior allocations/GC and raw retention confound comparison.
They do not prove either renderer's isolated footprint or a leak. Raw-vs-sampled
input both retained 1 million source samples. Upstream window/aggregation and
real endurance testing remain necessary. Interaction FPS, cold page-load p95,
Gateway CPU/heap, WebSocket transfer, end-to-end loss and 400 sessions are untested.

## External blockers and reusable configuration

- Network policy denies Nexus, official SDK documentation and ECharts docs hosts.
  Official intro/Nexus/ECharts probes returned CONNECT 403. Add the domains from
  ENVIRONMENT_SETUP in environment settings; then retry fresh requests.
- Environment draft reads and network/script/start_skill saves returned
  INVALID_ARGUMENT. Persistence is **unconfirmed**, no configuration fields are
  known saved, and nothing was published. Instructions are retained in
  docs/ENVIRONMENT_SETUP.md. Saving scripts alone would not execute/publish them.
- No staging Ignition Gateway/Designer, signing credentials or release authority
  was supplied. Do not invent these or treat a browser fixture as installation.

Required next checks: official 8.3 upgrade guide, real SDK compilation and artifact
inspection, signed/trusted staging installation, Designer palette/bindings, runtime
events, navigation, reconnect and upgrade/rollback. These prevent Phase 1/release
completion;400-session qualification is separate from the first functional build.
