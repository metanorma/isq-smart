# 02 — Type Safety

## Problems
1. `citation.test.ts:63` — `Cannot assign to 'designations' because it is a read-only property`
2. Unused imports in test files (2 warnings)
3. `tsconfig.json` doesn't extend Astro's config — missing `.astro` type support

## Tasks
- [ ] Fix `citation.test.ts` — use a fresh entry object instead of mutating readonly field
- [ ] Remove unused imports in test files
- [ ] Update `tsconfig.json`:
  ```json
  {
    "extends": "astro/tsconfigs/strictest",
    "compilerOptions": {
      "paths": { "@/*": ["./src/*"] }
    },
    "include": [".astro/types.d.ts", "**/*"],
    "exclude": ["dist", "node_modules"]
  }
  ```
- [ ] Run `astro check` — must show 0 errors, 0 warnings
- [ ] Ensure all Vue component props have TypeScript interfaces
- [ ] Ensure all composable return types are explicit (no `any`)

## Architecture Principle
Type safety is the foundation of correctness. No `any`, no unchecked casts, no bypassing the type system (equivalent to the "never use send/respond_to" rule).
