@AGENTS.md

Always use the full-qa skill when making code changes.

Never finish after only editing code.
Always verify with tests, build checks, startup checks, and relevant UI QA.
For web apps, verify affected tabs, routes, and screens.

When making any code change, always use the full-qa skill.

Before finishing any task:
- run lint if available
- run typecheck if available
- run tests if available
- run build if available
- verify the app starts
- verify affected routes, tabs, screens, forms, and interactions
- confirm the site opens smoothly without immediate runtime errors

Never finish immediately after editing code.
Never assume a small change is safe.
