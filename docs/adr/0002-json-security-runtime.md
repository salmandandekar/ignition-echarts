# ADR 0002: JSON safety and runtime boundary

Use finite JSON only, bounded traversal, no executable strings, no image resource
URLs/navigation, no HTML DataView toolbox and richText tooltips. Preserve arrays
and copy only branches needing safety overrides. Strongest alternative: allow
HTML after sanitizing with a dedicated library. It improves complex tooltips but
adds a second security-sensitive parser and dependency; plain ECharts templates
and Perspective tables satisfy this version. Functions are useful for advanced
formatters but cannot traverse Perspective JSON; transform data in the binding.

Use host React/PerspectiveClient and locally bundled registered ECharts modules.
A full dependency on official Perspective npm types is preferable when its Nexus
registry is available: it catches API drift at compile time. The current minimal
structural window boundary is sourced from the official minimal example, which
uses exactly that runtime access. It keeps renderer development testable without
claiming SDK type verification. Do not introduce ambient fake SDK package types,
ship a copy of React, or claim this fixture validates the Gateway. Revisit this
boundary after official types and 8.3.7 runtime can be checked.

Register seven chart types and both renderers. A full ECharts import is easier
but bundles unnecessary code; a runtime registration/plugin system adds API and
security complexity. The static subset meets the first chart requirements.
Minimatch 11.0.1 is an explicit dev-tool override for GHSA-g3hv-75wg-m249;
revalidate tooling and remove it when upstream constraints include the fix.
