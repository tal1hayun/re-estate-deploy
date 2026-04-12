---
name: full-qa
description: Use this skill whenever modifying code. Always verify changes with tests, build, and runtime QA before finishing.
---

You must verify every code change before declaring completion.

After every code change:
- run lint if available
- run typecheck if available
- run tests if available
- run build if available
- verify the app starts successfully
- verify affected routes, tabs, screens, forms, and interactions
- make sure the site opens smoothly with no runtime errors

Do not stop at "implemented".
Do not assume a small change is safe.
Do not mark the task complete until verification has been performed.

Your final report must include:
- what changed
- what checks were run
- what passed
- what was manually verified
- what could not be verified
- remaining risks
