# 02 — Home Page (index.astro)

## Goal
Native `.astro` page with data in frontmatter, static HTML template, Vue islands only for recently-viewed (localStorage) and count-up animation (inline script).

## Status: ✅ DONE

## What's Done
- All data fetching in Astro frontmatter (getDomains, getPartsByDomain, etc.)
- Static HTML template with Astro `.map()` instead of `v-for`
- `data-count` attributes on stat elements + inline `<script>` for count-up animation
- `RecentEntries.vue` — `client:idle` island for localStorage-dependent section
- JSON-LD rendered as `<script type="application/ld+json" set:html={...} />`
- Entry distribution bars use CSS variables for light/dark theming (no JS needed)
- Scroll reveal via inline `<script>` with IntersectionObserver

## Key Patterns
- `const asset = (path) => import.meta.env.BASE_URL + path.replace(/^\//, '')`
- `{items.map(item => <div>...</div>)}` instead of `v-for`
- `{condition && <span>...</span>}` instead of `v-if`
- `class={`base ${conditional}`}` instead of `:class`
- `style={`--var: ${value}`}` for CSS variable theming

## Remaining
- [ ] Verify count-up animation works in browser
- [ ] Verify scroll-reveal animation works
- [ ] Verify entry distribution bars render correctly in both themes
