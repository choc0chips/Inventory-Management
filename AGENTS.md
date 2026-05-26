<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Living project documentation (required)

`PROJECT_DOCUMENTATION.md` is the **source of truth** for StockWise architecture and features. It must stay synchronized with the codebase.

**No task is complete until:**

1. Code compiles and tests pass (where applicable).
2. `PROJECT_DOCUMENTATION.md` is updated for every affected section.
3. A changelog entry is appended under **Changelog** (date + Added/Updated/Fixed/Refactored).

**Before implementing:** read `PROJECT_DOCUMENTATION.md`, identify outdated/missing sections, and plan doc updates.

**After implementing:** update routes, models, server actions, components, folder structure, schema, commands, and limitations from the **actual** codebase — never assume features exist.

If code and documentation disagree, **update the documentation**.
