# Fix isq specs to run independently

## Current state
Specs were moved to `isq/spec/` but still reference `spec_helper.rb` and may have
path assumptions from the monorepo root.

## Target
- `isq/spec/spec_helper.rb` — create a local one that loads the isq gem
- Specs should pass with `cd isq && bundle exec rspec`
- Core class specs remain in `smart-sdu/spec/`

## How to apply
1. Create `isq/spec/spec_helper.rb`
2. Update require paths in `isq/spec/smart_sdu/export_validation_spec.rb` and `isoiec80000_spec.rb`
3. After module rename (TODO 01), update spec module references
4. Verify both spec suites pass independently
