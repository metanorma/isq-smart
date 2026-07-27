# 15 — Build pipeline formalization

## Problem
`build/stages/` has 10+ loosely organized functions. Each stage takes
different parameters — there's no uniform interface. The orchestrator
(`yaml-data-plugin.ts`) calls them in sequence with ad-hoc wiring.

## Solution
Define a `BuildStage` interface:
```ts
export interface BuildStage {
  readonly name: string
  execute(ctx: BuildContext): Promise<StageResult>
}
```

Each stage becomes a class implementing `BuildStage`. The orchestrator
runs stages in declared order, passing the shared `BuildContext`.

## Benefits
- **Uniform interface**: every stage looks the same to the orchestrator
- **Testable in isolation**: each stage takes a context, returns a result
- **Composable**: stages can be reordered or skipped without ad-hoc wiring
- **Observable**: stage name, duration, and result are loggable uniformly
