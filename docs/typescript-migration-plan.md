# TypeScript Tightening Plan

## Goal

Move toward stricter TypeScript without breaking delivery velocity.

## Current State

- `strict: true` is enabled.
- `allowJs: true` is enabled for mixed JS/TS compatibility.
- Content-generation scripts now run in TypeScript via `tsx`.

## Phased Plan

1. Stabilize script runtime
- Keep app `tsconfig.json` excluding `scripts/**/*.ts` for now.
- Use runtime checks (`npm run content:check`, `npm run content:test-flags`).

2. Add scripts typecheck lane
- Add `tsconfig.scripts.json` with:
  - `moduleResolution: "bundler"`
  - `noEmit: true`
  - start with `noImplicitAny: false`
- Add CI command: `tsc -p tsconfig.scripts.json --noEmit`.

3. Remove `any`/implicit gaps in scripts
- Add explicit parameter/return types in `scripts/lib/*.ts`.
- Promote `noImplicitAny: true` in `tsconfig.scripts.json`.

4. Tighten app config
- Turn `allowJs` to `false` in main `tsconfig.json`
  after JS files are migrated or intentionally excluded.

5. Finalize with lint gates
- Add ESLint rules for TS boundaries in scripts and app.
- Keep one shared source for env/config schemas.

## Exit Criteria

- `npm run build` passes.
- Script typecheck passes in CI.
- No runtime config parsing drift between app and scripts.
