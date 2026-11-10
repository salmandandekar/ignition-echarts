# Security policy

This pre-release implementation has no production-qualified supported release.
Do not use it as a security boundary for untrusted chart authors. Review proposed
options and bound data under your application's normal authorization model.

Report suspected vulnerabilities privately using GitHub **Report a vulnerability**
(Security advisories) for salmandandekar/ignition-echarts, if enabled. If private
reporting is unavailable, contact the repository owner privately through their
GitHub profile before sharing details. Do not file exploit details or secrets in
a public issue. A private reporting channel still needs maintainer confirmation;
no response-time guarantee is offered.

Include affected versions, a minimal sanitized reproducer, impact, prerequisites
and proposed mitigation. Never send real production credentials or data. Discuss
coordinated disclosure privately. Gateway/Perspective vulnerabilities outside
this module should follow Inductive Automation's official reporting process.

The module rejects executable configuration and external images/links, forces
richText tooltips and disables the HTML DataView toolbox. These controls do not
replace Gateway authorization or professional security review. SDK/Gateway
integration and long-duration resource testing remain release gates.
