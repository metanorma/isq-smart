# 15 — Build pipeline formalization

## Status: Evaluated — current approach is sufficient

## Analysis
The build pipeline stages are already well-separated functions with explicit
inputs/outputs:
- `loadEntries(paths)` → `{ quantities, math }`
- `filterEntries(raw, ctx)` → filtered entries
- `MathCollector.collect/render` → caches
- `buildParts(raw, caches, ctx)` → TS files
- etc.

Each function is independently testable and the orchestrator threads data
explicitly between stages. The BuildContext already centralizes paths,
exclusion checks, and route accumulation.

## Decision
Adding a `BuildStage` class interface would wrap each function in a class
with a `run(ctx)` method, but:
- **Deletion test**: deleting the class wrapper doesn't scatter complexity
- The functions already have the right depth (small interface, significant behavior)
- The orchestrator is the only caller — no polymorphism benefit

Formalization deferred. If stages need polymorphic dispatch (e.g.,
conditional stages, parallel execution), revisit this decision.
