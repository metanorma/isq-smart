# 09 — Component-level i18n: PageHero, Breadcrumb, PartEntryList

## Problem
Presentational components (`PageHero.astro`, `Breadcrumb.astro`, `PartEntryList.vue`, `EntryBrowser.vue`) accept hardcoded string props. The i18n system can only translate text that exists in the DOM at render time — string props baked into components are invisible to `data-i18n` unless wrapped.

## Solution
Each component should accept optional `i18nKey` variants of its string props:

```astro
<!-- Before -->
<PageHero title="Quantities" description="Browse all..." />

<!-- After -->
<PageHero titleKey="page.quantities.title" descriptionKey="page.quantities.description"
          title="Quantities" description="Browse all..." />
```

The component renders `data-i18n` attributes when keys are provided:
```astro
<h1 data-i18n={titleKey}>{title}</h1>
<p data-i18n={descriptionKey}>{description}</p>
```

### Components to update
- `PageHero.astro` — title, description, stat labels, breadcrumb labels
- `Breadcrumb.astro` — each crumb label
- `PartEntryList.vue` — filter placeholder, section headers
- `EntryBrowser.vue` — search placeholder, domain tabs, count labels

## Test plan
- Component renders data-i18n attribute when key is provided
- Component renders plain text when key is absent (backward compat)
- Text-matching fallback still works for components without keys
