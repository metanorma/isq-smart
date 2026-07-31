# 04 — useRecentEntries purification

## Problem
`useRecentEntries.ts` mixes localStorage CRUD with Vue reactivity.

## Solution
Extract pure storage logic to `src/lib/RecentEntriesStore.ts`.
