# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/)


### Added
- CHANGELOG.md


## [1.0.0] - 2025-06-01

### Changed
- All ontology IRIs base have changed with release 1.0.0
  - We now use [w3id](https://w3id.org/) instead of [purl](https://purl.org/).
  - This is caused by frequent recent outages of purl.org and lack for features for joint enterprise collaborative development.
  - Older IRIs start with: `https://purl.org/smart-standards/`
  - Newer IRIs start with: `https://w3id.org/standards/smart/ontologies/`
  - This applies to the TBX and Core ontologies, see examples.
  - Existing data is not affected by this change.
