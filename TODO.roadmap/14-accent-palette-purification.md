# 14 — Purify useAccent: separate color math from Vue

## Problem
`src/composables/useAccent.ts` mixes pure color computation (accentColors,
accentGradient, accentGlow, accentHeaderBg) with Vue reactivity patterns.
The pure functions are already used by non-Vue modules (EntryAccentResolver,
PartRegistry pages) but live in a composable file.

## Solution
Extract pure functions to `src/lib/AccentPalette.ts`:
```ts
export class AccentPalette {
  static colors(meta: PartMeta): { from: string; to: string }
  static gradient(meta: PartMeta, angle: number): string
  static glow(meta: PartMeta, alpha: number, blur: number): Record<string, string>
  static headerBg(meta: PartMeta): Record<string, string>
}
```

`useAccent.ts` becomes a thin Vue wrapper importing from AccentPalette.

## Test plan
- AccentPalette: color resolution for each accent type
- useAccent: Vue integration unchanged
