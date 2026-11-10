# Cloud environment setup

The current machine supports frontend development and standalone browser testing.
It is **not fully configured for the module workflow**: Nexus access blocks SDK
compilation, and reusable environment draft persistence failed with INVALID_ARGUMENT.
No configuration change or publication was confirmed. These on-disk instructions
are a fallback for review, not a claim that start_skill/install_script were saved.

Use the existing `/workspace/ignition-echarts` checkout. Each cloud task is already
isolated; do not create a worktree unless the user explicitly requests it. Preserve
source/user changes and do not reset the checkout during installation.

Current tools: Node 24.22.1, npm 11.9.0, OpenJDK 21.0.13 and system Chromium. Gradle 8.14.3
is provided through the verified wrapper; Java compilation uses release17. Retain
node_modules and Gradle/npm caches in the published snapshot; live dev servers do
not survive publication. No required credentials/environment secrets were found,
and Git read access via the existing platform HTTPS proxy succeeded.

Required destinations beyond the package-manager preset:
- `nexus.inductiveautomation.com`: SDK/module-signer and official Perspective npm package.
- `www.sdk-docs.inductiveautomation.com`: official8.3 intro and upgrade guide.
- `echarts.apache.org`: official reference documentation (GitHub source was available).

Add these in environment settings, preserving any other configured domains.
The attempted draft addition was not saved. No token or password is needed for
these public artifacts; do not supply secrets in chat. Test a fresh connection
and rerun the blocked Gradle operation after the policy changes.

## Installation/refresh script

The frontend commands were executed successfully. The final Gradle command is
known blocked by Nexus 403 and must complete after access is configured.

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /workspace/ignition-echarts
export npm_config_cache=/workspace/.cache/npm
export GRADLE_USER_HOME=/workspace/.cache/gradle
mkdir -p "$npm_config_cache" "$GRADLE_USER_HOME"
node --version
java -version
npm --prefix web ci --no-fund
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web test
npm --prefix web run build
npm --prefix web run licenses
node scripts/check-contract.mjs
python3 scripts/gradle-cloud.py --no-daemon --console=plain :common:compileJava :gateway:compileJava :designer:compileJava zipModule
python3 scripts/validate-artifact.py
```

## Start instructions for future tasks

1. Use the existing checkout at `/workspace/ignition-echarts`; cloud tasks are
   isolated, so do not create worktrees unless explicitly requested.
2. Set npm_config_cache=/workspace/.cache/npm and GRADLE_USER_HOME=/workspace/.cache/gradle.
   Verify Node and Java versions and installed web dependencies. Use npm ci only
   when dependencies are absent/outdated; do not reinstall while tests are running.
3. Standard workflow is editing native module/frontend source, running frontend
   checks then compiling/packaging with the official Gradle command above. No
   Gateway process is present; never claim SDK/Gateway acceptance from the harness.
4. For frontend interaction, start `npm --prefix web run dev -- --port 5173 --strictPort`
   from this checkout. Keep its process alive only while needed. Validate with
   `curl -fsS http://127.0.0.1:5173/` and a real browser/chart functional check.
   Do not publish user-facing localhost preview links in onboarding.
5. For automated browser validation run
   `cd web && CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`.
   It starts/stops its own dev server; do not run a competing manual server on5173.
   `npm run benchmark` runs a separate diagnostic server on that port; serialize them.
6. Inspect failures, preserve command statuses and report unexecuted checks. Real
   Gateway installation requires a separately supplied and authorized staging
   Gateway. Follow docs/INSTALLATION.md; never deploy or publish without approval.

Review and save necessary settings, then use the product's Publish action when
setup is complete. This task has not published or validated a fresh task restore.
