# 05: Home Page Restructure

## Goal
The home page should present instance data (quantities, documents, provisions) as peer sections, with the ontology as a separate information-model concern.

## Layout

### Hero Section
- Keep the current hero with project title
- Simplify stats to show all data types

### Primary Sections (instance data)
1. **Quantities & Units** — current part grid
2. **Mathematical Notation** — current math section
3. **Documents** — card linking to `/documents` showing document count
4. **Provisions** — card linking to provisions overview

### Secondary Section (information model)
5. **ISO/IEC 80000 Ontology** — current ontology card, expanded with key metrics

## Tasks
- [ ] Add document/provision count stats to hero
- [ ] Add Documents section with card layout
- [ ] Add Provisions section
- [ ] Move ontology section to secondary position
- [ ] Update import in `index.vue` to include document/provision counts
