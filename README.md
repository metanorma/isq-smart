# SmartSDU

Ruby gem and browser for the [SmartSDU (IEC-ISO) Core Ontology](https://w3id.org/standards/smart/ontologies/core/) information model. Maps the OWL ontology to `lutaml-model` classes with Turtle and JSON-LD serialization, and provides a Vue.js browser for ISO/IEC 80000 quantities, units, and mathematical notation.

## Quick start

```bash
bundle install
cd browser && npm install && cd ..
bin/dev          # start dev server → http://localhost:5173
```

The Vite plugin reads YAML source data at build time and auto-generates TypeScript data modules. No manual build step needed for development.

## Commands

| Command | Description |
|---------|-------------|
| `bin/dev` | Start Vite dev server |
| `bin/build` | Production build to `browser/dist/` |
| `bin/check` | Run Ruby specs + frontend type check |
| `bundle exec rake export:all` | Generate downloadable TTL/JSON-LD files |

## Data pipeline

The browser reads from the [`iso-iec-80000`](../iso-iec-80000/) sibling directory:

- `sources/dataset/quantities.yaml` — quantity and unit entries (parts 3–13)
- `sources/dataset/math.yaml` — math notation entries (part 2)
- `sources/{iso,iec}-80000-*/` — AsciiDoc document sections (provisions, clauses)

The Vite plugin (`browser/vite.config.ts`) transforms this YAML into TypeScript modules under `browser/src/data/generated/` at build time. No runtime API calls.

## Ruby gem

### Class hierarchy

All classes support `to_turtle` and `to_jsonld` via `lutaml-model`.

**SmartSDU Core** (`smart:` namespace):

```
Entity
├── Provision (abstract)
│   ├── Statement
│   ├── Instruction
│   ├── Requirement
│   ├── Recommendation
│   ├── Permission
│   ├── Capability
│   ├── Possibility
│   └── ExternalConstraint
├── ProvisionSet (abstract)
│   └── Clause
├── ProvisionSupplement
├── TermEntry
├── Term
├── PublicationDocument
├── Agent
│   └── Organization
└── Activity
```

**ISO/IEC 80000 Domain** (`isoiec80000:` namespace, extends `smart:TermEntry`):

```
TermEntry
├── Quantity      — physical quantity with units
├── Unit          — unit of measurement
└── MathConcept   — mathematical concept
```

### Using the gem

```ruby
require "smart_sdu"

# Publication document
doc = SmartSdu::PublicationDocument.new(
  id: "iso80000-3",
  publication_type: "internationalStandard",
)
puts doc.to_turtle
puts doc.to_jsonld

# ISO/IEC 80000 quantity with unit
q = SmartSdu::IsoIec80000::Quantity.new(
  id: "t3-1.1",
  identifier: "3-1.1",
  pref_label: "length",
  notation: %w[l L],
  definition: "linear extent in space between any two points",
  bindingness_type: "normative",
  is_part_of: "isoiec80000:part-3",
  has_unit: ["isoiec80000:unit-m"],
)
puts q.to_turtle
puts q.to_jsonld
```

### Structure

```
lib/smart_sdu.rb                          # entry point
lib/smart_sdu/
  entity.rb                               # Entity < Lutaml::Model::Serializable
  provision.rb                            # Provision + autoloads subtypes
  provision/statement.rb                  # Statement < Provision
  provision/requirement.rb                # Requirement < Provision
  ...
  clause.rb                               # Clause < ProvisionSet
  term_entry.rb                           # TermEntry < Entity
  publication_document.rb                 # PublicationDocument < Entity
  taxonomy.rb                             # Taxonomy module
  taxonomy/bindingness_type.rb            # SKOS concept instances
  isoiec80000.rb                          # IsoIec80000 module
  isoiec80000/quantity.rb                 # Quantity < TermEntry
  isoiec80000/unit.rb                     # Unit < TermEntry
  isoiec80000/math_concept.rb             # MathConcept < TermEntry
  rdf/namespaces/
    smart_namespace.rb                    # smart: prefix
    isoiec80000_namespace.rb              # isoiec80000: prefix
```

## Running tests

```bash
bin/check                      # Ruby specs + frontend type check
bundle exec rspec               # Ruby specs only (43 examples)
cd browser && npx vitest run    # Browser tests only
```
