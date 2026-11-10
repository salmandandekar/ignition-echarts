# Installation and release gates

There is **no verified installable artifact from this cloud session**. Gradle
failed resolving Nexus-hosted module-signer before Java compilation. These are
reproducible acceptance instructions for after a successful build, not evidence
that installation works. Target Ignition 8.3.7 with Perspective; minimum family
8.3 is intended, not yet qualified. Windows and Linux Gateways need separate tests.

## Produce a development artifact

Use Node 24.22.1 and JDK 21 (Java source compiled with `--release 17`), then:

```sh
cd ignition-echarts
npm --prefix web ci
npm --prefix web run lint
npm --prefix web test
npm --prefix web run build
./gradlew --no-daemon :common:compileJava :gateway:compileJava :designer:compileJava zipModule
python3 scripts/validate-artifact.py
sha256sum build/IgnitionECharts-0.1.0-dev.1.unsigned.modl
```

The official Gradle plugin creates
`build/IgnitionECharts-0.1.0-dev.1.unsigned.modl` only if dependency resolution,
compilation, frontend generation and packaging succeed. The current session did
not produce that file. In the managed cloud use
`python3 scripts/gradle-cloud.py ...` with the same Gradle arguments to activate
Java proxy settings. Do not lower TLS/checksum verification.

## Install on a separately authorized staging Gateway

1. Back up the Gateway and export the Perspective project. Use an isolated
   Ignition 8.3.7 installation with Perspective and appropriate licensing/trial.
2. Obtain a validated `.modl` and its checksum from your own successful build or a
   qualified release. Check SHA256 against the trusted release/build record.
3. Sign for distribution using the official Inductive Automation module signer
   and your organization's approved certificate/trust procedure. Keep keystore,
   alias and passwords outside source control. See
   https://github.com/inductiveautomation/module-signer and official SDK signing
   instructions. `skipModlSigning=true` creates only a development artifact; it
   does not grant Gateway trust or bypass signature requirements.
4. In Gateway configuration open the Modules installation page, select the
   validated module, review license and signer/trust prompts, and install using
   the supported procedure for that Gateway. An unsigned development artifact
   requires a specifically configured isolated development Gateway; this project
   does not disable signature enforcement or document a global bypass.
5. Follow Gateway restart requirements. Reopen Designer and reload browser
   sessions after installation/upgrade so cached assets cannot mask failures.
6. Open a Perspective project/view. Locate **Charts > ECharts**, drag it onto the
   view, and confirm the default line chart renders. Allocate a nonzero size.
7. Set `props.option` to `examples/pie.json`; preview, launch a session, and confirm
   the result. Apply a named-query/tag/history binding via a script transform.
8. Add an onChartClick event script, e.g. inspect `event.seriesIndex` and
   `event.dataIndex` without logging sensitive values. Test zoom/legend handlers.
9. Inspect Designer, browser console and Gateway logs. Navigate repeatedly, test
   several independent charts and resized/hidden layouts, interrupt/reconnect the
   session, then test an upgrade and rollback using the saved project backup.

Record exact Gateway/module/browser versions, installation trust steps, restart
behavior and test results in BUILD_EVIDENCE before marking Phase 1 complete.

## Public release

Do not publish until the signed artifact, dependency/license review, real
Gateway/Designer/session behavior, migration/rollback, target browser matrix and
release notes/checksums pass review. Signing credentials belong in secure CI
secrets or an offline signing process. The repository workflow uploads only
unsigned development artifacts and never publishes a GitHub Release. No release,
external deployment or Gateway mutation was performed here.
