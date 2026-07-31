# 03 — useTheme purification

## Problem
`useTheme.ts` mixes theme state management (dark/light) with Vue reactivity
and localStorage access.

## Solution
Extract pure theme logic to `src/lib/ThemeManager.ts`.
