# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This monorepo produces the **ISQ Browser** — a static SPA for browsing ISO/IEC 80000 quantities, units, and mathematical notation. It also builds Ruby gems for the SmartSDU Core Ontology and the ISO/IEC 80000 domain.

## Repository Layout

| Directory | Description |
|---|---|
| `smart-sdu/` | Core SmartSDU ontology gem (`SmartSdu` module) — Entity, Provision, TermEntry, Taxonomy, RDF namespaces |
| `sdu_smart/` | ISO/IEC 80000 domain gem (`SduSmart` module) — Quantity, Unit, MathConcept extending SmartSdu::TermEntry. Contains `rake export:all` for TTL/JSON-LD generation |
| `browser/` | Vue.js 3 + TypeScript + Tailwind CSS v4 static site. Vite plugins generate data at build time |
| `reference-docs/` | SmartSDU information model reference (OWL, SHACL, SKOS in Turtle) |
| `bin/` | Dev scripts: `bin/check` (all specs + type-check), `bin/export` (rake export:all) |

## Commands

```bash
cd browser && npm run dev          # Vite dev server → http://localhost:5173
cd browser && npm run build        # vue-tsc + vite build
cd smart-sdu && bundle exec rspec  # Core ontology specs
cd sdu_smart && bundle exec rspec  # Domain gem specs
bin/check                          # All specs + frontend type-check
bin/export                         # Generate TTL/JSON-LD exports
```

Requires the `iso-iec-80000` sibling repo for YAML source data:
```bash
cd .. && git clone https://github.com/metanorma/iso-iec-80000.git && cd sdu-smart/browser
```

## Ruby Gem Architecture

### smart-sdu (core)

Base classes inheriting from `Lutaml::Model::Serializable`:
- `SmartSdu::Entity` → base
- `SmartSdu::TermEntry` → entries in terminology (extended by sdu_smart)
- `SmartSdu::Term` → skosxl label instances
- `SmartSdu::PublicationDocument` → document metadata
- `SmartSdu::Taxonomy` → SKOS concept instances (BindingnessType, TermFormType, etc.)

### sdu_smart (domain)

Extends core with ISO/IEC 80000-specific classes:
- `SduSmart::Quantity` < `SmartSdu::TermEntry` — has identifier, pref_label, definition, note, has_unit
- `SduSmart::Unit` < `SmartSdu::TermEntry` — has pref_label, notation
- `SduSmart::MathConcept` < `SmartSdu::TermEntry` — has identifier, pref_label, definition, note

RDF namespaces: `smart:` → core ontology, `isoiec80000:` → 80000 domain.

Export task (`sdu_smart/lib/tasks/export.rake`) reads YAML from `iso-iec-80000/sources/dataset/` and writes TTL/JSON-LD to `browser/public/exports/`. Paths configurable via `ISQ_DATASET_DIR` and `ISQ_EXPORT_DIR` env vars.

## Browser Architecture

- **Build-time data pipeline**: Two Vite plugins (`yaml-data`, `ontology-data`) read YAML/Turtle sources and generate ~40 TypeScript modules into `src/data/generated/`
- **Pages**: Lazy-loaded per-part data via Vue Router. Key pages: quantities listing, math notation, units browser, dimensions, ontology browser, documents
- **Routing**: Uses `createWebHistory()` — host must redirect all paths to `index.html`

### Reference Architecture

The ontology information model is in `reference-docs/smartsdu-information-model-share-c6362d946900/`. Core classes, taxonomy instances, SHACL constraints, and object properties are defined in Turtle files under `information_model/`.

The `lutaml-model` framework is at `/Users/mulgogi/src/lutaml/lutaml-model/` — supports serialization to JSON, XML, YAML, TOML, JSON-LD, and Turtle.

Follow the `../sts-ruby/` pattern: `Lutaml::Model::Serializable` subclasses, `attribute` definitions, `xml do` mapping blocks, autoload pattern.
