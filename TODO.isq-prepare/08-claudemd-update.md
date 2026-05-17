# Update CLAUDE.md for new structure

## Current state
`CLAUDE.md` at repo root references old paths like `../iso-iec-80000/` and
describes the gem as a single unit.

## Target
- Update architecture description to show `smart-sdu/`, `isq/`, `browser/` as siblings
- Update all file path references
- Note the gem split and dependency relationship
- Update build commands section

## How to apply
1. Rewrite CLAUDE.md to reflect the three-component monorepo structure
2. Reference `smart-sdu/CLAUDE.md` and `isq/CLAUDE.md` if per-gem guidance is needed
