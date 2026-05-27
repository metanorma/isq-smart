# Performance Audit

## Current State

No performance testing or measurement. The app is a static SPA served from CDN, so server-side performance is not a concern. But client-side performance matters for the ~200+ entry pages and the ontology browser with ~176 entities.

## Identified Issues

### 1. `findByQname()` — Linear Scan on Every Lookup

All three ontology panels (and the ontology detail page) use:

```ts
function findByQname(qname: string): OntEntity | undefined {
  return allEntities.find(e => e.qname === qname)
}
```

This is O(n) for each lookup. A single `EntryOntologyPanel` render calls `findByQname` ~10-15 times (class, shapes, properties, parent chain walking). With 176 entities, this is currently fast enough, but the repeated scanning is wasteful.

**Fix:** Build a `Map<string, OntEntity>` once at module load:

```ts
const entityMap = new Map(ontologyEntities.map(e => [e.qname, e]))
export function findByQname(qname: string): OntEntity | undefined {
  return entityMap.get(qname)
}
```

### 2. Duplicate `Map` Construction in PartRegistry

`partMap` is built once (good), but `getPartsByDomain` filters the full array on every call. Vue components call this in computed properties that re-run on route changes.

**Fix:** Pre-compute `Map<Domain, PartMeta[]>` at module load.

### 3. Large Generated `ontology.ts` — Eagerly Loaded

`ontology.ts` is ~3000+ lines and imported directly by components. This means the entire ontology data is in every page bundle that uses any ontology feature.

**Fix:** Use dynamic `import()` in components that conditionally show ontology panels (e.g. only when expanded). Or split ontology data into core entities (classes, properties) and SHACL detail.

### 4. `DataLoader.loadPart()` — No Caching

Each navigation to a part page calls `DataLoader.loadPart(partKey)`, which triggers `import.meta.glob` dynamic imports. Vue Router doesn't cache the result — re-visiting the same part re-imports.

**Fix:** Add a simple cache:

```ts
const cache = new Map<string, PartData>()
async loadPart(partKey: string): Promise<PartData> {
  if (cache.has(partKey)) return cache.get(partKey)!
  const data = await /* ... */
  cache.set(partKey, data)
  return data
}
```

### 5. AsciiDoc Rendering — Called on Every Access

`renderStem(text, cache, xrefMap)` renders AsciiDoc stems to MathML. The `mathCache` is passed per-part, so the same entry's math is re-rendered on every `definition()` or `remarks()` call if the cache is lost.

**Fix:** The cache is already per-part and shared within a page load. Ensure the cache persists across the component lifecycle (it does currently via `PartData.mathCache`). No change needed unless profiling shows issues.

### 6. CSS — Tailwind v4 Utility Generation

Tailwind v4 generates utilities on-demand. The current `main.css` has ~500 lines of hand-written dark mode overrides. These are unlayered and beat Tailwind's `@layer utilities` — this is correct but means the CSS file is larger than necessary.

**Fix:** After Tailwind v4 stabilizes its dark mode strategy, evaluate migrating the hand-written dark overrides to proper `@theme` or `@variant` declarations. Low priority — the current approach works correctly.

### 7. `import.meta.glob` Pattern Matches All Part Files

```ts
const partModules = import.meta.glob('./generated/part-*.ts')
```

This creates a separate dynamic import for each matched file. With 30+ part files, this is 30+ chunk files in the build. Each chunk is small (~5-20KB) so this is fine for HTTP/2 multiplexing.

**Fix:** No change needed. Lazy-loading per-part is the correct strategy for this data volume.

## Priority Order

1. **`findByQname` → Map lookup** — easy win, affects every ontology panel render
2. **DataLoader caching** — easy win, avoids re-imports on revisits
3. **Lazy-load ontology data** — moderate effort, reduces initial bundle
4. **Pre-compute domain map** — minor, only affects page transitions
5. **CSS audit** — low priority, no user-visible impact

## Measurement

Before making changes, add baseline measurement:

```bash
npx vite build --mode production && npx vite-bundle-visualizer
```

Lighthouse CI for runtime performance:

```bash
npx lighthouse http://localhost:4173 --output json --chrome-flags="--headless"
```

Focus on: First Contentful Paint, Largest Contentful Paint, Total Blocking Time.
