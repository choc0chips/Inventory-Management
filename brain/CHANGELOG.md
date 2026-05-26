# Brain Changelog

## v0.1.5 — 2026-05-25

### Fixed
- `/auth` 404/500: root layout no longer queries SQLite on auth route; `middleware.ts` migrated to `proxy.ts` (Next.js 16); stale dev server + Node native module mismatch addressed via rebuild.

## v0.1.4 — 2026-05-25

### Fixed
- Auth page broken layout: `components/ui/tabs.tsx` used `data-horizontal` but Base UI emits `data-orientation="horizontal"`, so tabs and form rendered in one row. Corrected selectors; auth inputs set to full width.
- Auth route bypasses `AppShell` sidebar so the login card is centered full-screen (not squeezed into dashboard layout).

## v0.1.3 — 2026-05-25

### Fixed
- Base UI console warning: modal forms remount via `key` when switching create/edit so `defaultValue` on `Input` does not change after mount.

## v0.1.2 — 2026-05-25

### Fixed
- `better-sqlite3` runtime: missing `better_sqlite3.node` because pnpm 10 did not run native install scripts.

### Changed
- `package.json`: `pnpm.onlyBuiltDependencies` includes `better-sqlite3`; `postinstall` runs `pnpm rebuild better-sqlite3`.

## v0.1.1 — 2026-05-25

### Fixed
- Prisma build failure: missing `@/app/generated/prisma/client` because generated client was gitignored and never created on fresh clone.

### Changed
- `package.json`: added `postinstall: prisma generate` and `build: prisma generate && next build`.
