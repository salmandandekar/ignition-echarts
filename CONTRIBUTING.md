# Contributing

This is an independent community project. Start with README, docs/REQUIREMENTS.md
and the ADRs. Use the existing checkout; a cloud task is already isolated.

Use Node 24.22.1, npm ci with the committed lockfile, and JDK 21 compiling release17.
Run frontend lint/typecheck/tests/build/licenses, browser tests and the actual
Gradle module build/artifact validator before a pull request. A mocked test is not
Gateway acceptance. Record unexecuted checks and exact blockers in the PR.

Keep TypeScript strict with no arbitrary any, small React/controller methods,
explicit resource ownership, cohesive Java naming and JSON-only options. Preserve
component IDs/property schema, error containment, local assets and host React
externals. Pin direct dependency versions, update the lockfile intentionally,
scan dependencies and preserve package verification. Do not add credentials or
weaken security to pass a test. Consider formatting with the project's existing
style; automated formatting enforcement is a future improvement.

Issues should include module/Gateway/browser/OS versions, a minimal sanitized
option, steps, expected/actual behavior and relevant redacted logs. Do not post
credentials, confidential production values or vulnerability exploit details.
Propose features with use case, JSON/property compatibility, lifecycle and test
implications. Avoid duplicating the complete ECharts option schema.

PRs should state the concrete problem and resulting behavior, tests executed,
remaining integration checks, dependency/license implications and migration needs.
Review Critical/High risks, update requirement traceability and changelog, and use
separate review for release/signing/Gateway deployment. Maintainers decide merge
and release; contributor code is offered under this repository's Apache 2.0 license.
