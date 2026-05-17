# Update isq Rakefile export paths

## Current state
`isq/lib/tasks/export.rake` has hard-coded relative paths:
```ruby
DATASET_DIR = File.join(__dir__, "..", "..", "..", "iso-iec-80000", "sources", "dataset")
EXPORT_DIR = File.join(__dir__, "..", "..", "..", "browser", "public", "exports")
```

After the move from `lib/tasks/` (at repo root) to `isq/lib/tasks/`, these paths
now resolve differently.

## Target
- `DATASET_DIR` should point to `../../iso-iec-80000/sources/dataset` (relative to isq root)
- `EXPORT_DIR` should point to `../browser/public/exports` (relative to isq root)
- Make these configurable via environment variables

## How to apply
1. Update path constants in `isq/lib/tasks/export.rake`
2. Or use `ENV.fetch('ISO_80000_DATASET_DIR', default_path)`
3. Verify: `cd isq && bundle exec rake export:all`
4. Check that files appear in `browser/public/exports/`
