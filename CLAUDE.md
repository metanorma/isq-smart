# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This project builds Ruby `lutaml-model` classes to represent the SmartSDU (IEC-ISO) Core Ontology information model. The goal is to create Ruby classes that can serialize/deserialize SMART standards content defined by the OWL ontology.

The reference implementation pattern is `../sts-ruby/` — a gem that maps NISO STS XML elements to `lutaml-model` classes.

## Reference Architecture

### Information Model (from `reference-docs/smartsdu-information-model-share-c6362d946900/`)

The ontology is defined in Turtle (`.ttl`) files under `information_model/`:

**Core classes** (`ontologies/core-ontology.ttl`):
- `Entity` — base class
- `Provision` (subclasses: `Statement`, `Instruction`, `Recommendation`, `Requirement`, `Permission`, `Capability`, `Possibility`, `ExternalConstraint`)
- `ProvisionSet` → `Clause`
- `ProvisionSupplement`
- `Term`, `TermEntry`
- `PublicationDocument`
- `Agent` → `Organization`
- `Activity`

**Taxonomy/enumeration classes** (each with SKOS concept instances in `taxonomies/*.ttl`):
- `BindingnessType`: informative, normative
- `ProvisionType`: assertionalProvision, governingProvision
- `PublicationComponentType`: code, figure, mathematicalFormula, table, textual
- `PublicationDocumentType`: guide, publiclyAvailableSpecification, technicalReport, technicalSpecification, normativeDocument, standard, internationalStandard
- `ProvisionSupplementType`: example, footnote, note
- `PartOfSpeechType`: adjective, adverb, noun, verb
- `TermFormType`: abbreviation, acronym, equation, formula, fullForm, symbol, variant

**Object properties** (relationships): `hasBindingnessType`, `hasProvisionType`, `hasPublicationComponentType`, `hasPublicationType`, `hasSupplement`, `hasSupplementType`, `hasPartOfSpeechType`, `hasTermFormType`, `isSuccessorOf`, `isPartOf`/`hasPart`, `references`

**Data properties**: `pronunciation`, `usedInCountry`

**SHACL constraints** (`schemas/shacl/core-ontology.shacl.ttl`): defines cardinality and type constraints (e.g., a Provision must be `isPartOf` exactly one Clause or PublicationDocument).

**External vocabulary** (`ontologies/external/vocabulary.ttl`): W3C Web Annotation (OA) classes — `Annotation`, `Selector`, `SpecificResource`, `XPathSelector`, `SvgSelector`.

### Pattern from sts-ruby

Follow the `../sts-ruby/` project structure:
- Classes inherit from `Lutaml::Model::Serializable`
- Attributes defined with `attribute :name, :type`
- XML mapping in `xml do ... end` block
- Autoload pattern in the main module file
- `../sts-ruby/CLAUDE.md` has the detailed pattern

## lutaml-model

The modeling framework is at `/Users/mulgogi/src/lutaml/lutaml-model/`. It supports serialization to JSON, XML, YAML, TOML, JSON-LD, and Turtle. Key features: attribute definitions, XML mapping, mixed content, collections, custom adapters.

## Sample Documents

ISO standard XML for testing: `../mn-samples-iso-private/reference-docs/ISO_34000_2023/iso_std_iso_34000_ed-1_v1_en.xml`

The `../sts-ruby/` project can be used to parse these NISO STS XML documents.
