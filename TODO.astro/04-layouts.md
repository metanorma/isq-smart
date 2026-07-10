# 04 — Layouts Migration

## Goal
Convert the two Vue layouts (`Default.vue`, `OntologyLayout.vue`) to Astro layouts. Interactive header elements become Vue islands.

## Current Layouts
- `src/layouts/Default.vue` — site chrome: header (nav, search, theme toggle), footer, toast container, back-to-top
- `src/layouts/OntologyLayout.vue` — ontology browser chrome: sidebar + content area

## Tasks

### 4.1 Create Astro base layout
**File:** `src/layouts/BaseLayout.astro`
- HTML shell (`<html>`, `<head>`, `<body>`)
- Meta tags, fonts, theme-color (inline script for dark-mode flash prevention)
- Imports `src/styles/main.css`
- `<slot />` for page content

### 4.2 Create Default layout
**File:** `src/layouts/DefaultLayout.astro`
- Wraps BaseLayout
- Site header (Vue island: `client:load` — contains GlobalSearch, theme toggle, language toggle)
- Site footer (static — already converted to work without Vue Router)
- Toast container (Vue island: `client:idle`)
- Back-to-top (Vue island: `client:visible`)
- `<slot />` for page content

### 4.3 Create Ontology layout
**File:** `src/layouts/OntologyLayout.astro`
- Wraps DefaultLayout
- Adds ontology sidebar (Vue island: `client:idle`)

### 4.4 Decompose header into islands
- `SiteHeader.vue` — wraps GlobalSearch, theme toggle, language toggle
- Import as `<SiteHeader client:load />` in DefaultLayout

## Acceptance Criteria
- All pages render with correct chrome
- Header interactivity (search, theme) works on page load
- Footer renders without JavaScript
- Dark mode persists across pages without flash
