# 06 — MDX content collections per locale

## Problem
Long-form pages (`methodology/*`, `about`, `terminology`, `reference`) have English-only content baked into `.astro` templates. There's no mechanism for per-locale content variants. The user explicitly wants "MDX/MD per language".

## Solution
Use Astro's **content collections** with locale suffixes:

### Directory structure
```
src/content/
  methodology/
    concept-system.en.mdx
    concept-system.fr.mdx
    navigation.en.mdx
    navigation.fr.mdx
    references.en.mdx
    references.fr.mdx
  about/
    index.en.mdx
    index.fr.mdx
  terminology/
    index.en.mdx
    index.fr.mdx
```

### Content config
`src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content' }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(['en', 'fr']),
    order: z.number().optional(),
  }),
})

export const collections = { docs }
```

### Page rendering
```astro
--- methodology/concept-system.astro ---
const { locale } = useLanguage()
const entry = await getEntry('docs', `concept-system.${locale}`)
const { Content } = await entry.render()
<Content />
```

## Benefits
- **OCP**: Adding a new locale = add `.fra.mdx` files, no code changes
- Editors can translate content without touching code
- Astro handles MDX rendering, frontmatter validation, and caching
- Content is version-controlled and diffable

## Scope
Start with `about` and `methodology/*` pages (5 pages × 2 locales = 10 MDX files). Terminology and reference can follow.

## Test plan
- Each MDX page renders in both locales
- Missing locale falls back to English with a warning
- Frontmatter schema validates
