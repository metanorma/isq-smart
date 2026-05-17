# Rename isq gem module from SmartSdu::IsoIec80000 to Isq

## Current state
Files live in `isq/lib/smart_sdu/isoiec80000/` with module `SmartSdu::IsoIec80000`.
The `smart_sdu.rb` autoload for `IsoIec80000` was removed in the split.

## Target
- Move `isq/lib/smart_sdu/isoiec80000/` → `isq/lib/isq/`
- Rename `isq/lib/smart_sdu/isoiec80000.rb` → `isq/lib/isq.rb`
- Update module declarations: `SmartSdu::IsoIec80000::Quantity` → `Isq::Quantity`
- Update all `require_relative` and autoload paths
- Update specs in `isq/spec/` to use new module names
- Add `isq/lib/isq/version.rb`

## Why
The isq gem should have its own identity. `SmartSdu::IsoIec80000::Quantity` is verbose;
`Isq::Quantity` is clean. The gem `smart_sdu` is a dependency, not the namespace.

## How to apply
1. Rename directory and files
2. Update module declarations in each class file
3. Update `isq/lib/isq.rb` entry point with autoloads
4. Update `isq/isq.gemspec` version to read from `isq/lib/isq/version.rb`
5. Run specs to verify
