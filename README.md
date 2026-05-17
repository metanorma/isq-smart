# sdu-smart

Monorepo for the SmartSDU Core Ontology and the ISO/IEC 80000 browser.

## Repository layout

```
sdu-smart/
  smart-sdu/        Core SmartSDU ontology gem (Entity, Provision, TermEntry…)
  sdu_smart/        ISO/IEC 80000 domain gem (Quantity, Unit, MathConcept) + RDF exports
  browser/          Vue.js static site — the ISQ browser
  reference-docs/   SmartSDU information model reference (OWL, SHACL, SKOS)
  .github/          CI workflows
```

## Quick start

```bash
cd browser
npm install
npm run dev          # → http://localhost:5173
```

Requires YAML source data from the `iso-iec-80000` sibling repo. Clone it alongside this repo:
```bash
cd .. && git clone https://github.com/metanorma/iso-iec-80000.git && cd sdu-smart/browser
```

See [browser/README.md](browser/README.md) for full setup details.
