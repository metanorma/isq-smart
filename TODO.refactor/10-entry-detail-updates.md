# 10 — Entry Detail: Show Hierarchy Context

## Goal

Update the entry detail page (`/quantities/part-[part]/[id].astro`) to show concept hierarchy context.

## Changes

### New sections on entry detail page

1. **Kind of Quantity badge** — near the entry title, show which kind(s) this quantity belongs to. Links to the kind page.

2. **Broader concepts panel** — if the entry has broader concepts, show them in a sidebar section. Each links to the broader concept.

3. **Narrower concepts panel** — if the entry has narrower concepts, show them. E.g., "speed" would show "phase speed", "group speed" as narrower.

4. **Entity characterization panel** — if the quantity characterizes specific entities, show them. E.g., "sound particle displacement" → entity: "particle".

5. **Related quantities by kind** — "Other length-type quantities" section showing same-kind siblings.

### Layout

Use the existing two-column layout (main + sidebar). Hierarchy info goes in the sidebar, below the existing metadata.

## Implementation

- Load `kinds`, `hierarchy`, `entities` from generated modules in Astro frontmatter
- Pass to Vue islands for interactive display
- Use `BroaderNarrowerList.vue`, `EntityList.vue` components

## Status: DONE
