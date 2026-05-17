# Update bin/ scripts for new structure

## Current state
`bin/dev`, `bin/build`, `bin/check` at repo root reference old paths.

## Target
- `bin/dev` → starts browser dev server (unchanged, still works)
- `bin/build` → builds browser (unchanged, still works)
- `bin/check` → needs updating: should run specs in both `smart-sdu/` and `isq/`,
  then type-check browser
- Add `bin/export` → runs `cd isq && bundle exec rake export:all`

## How to apply
1. Update `bin/check` to `cd smart-sdu && bundle exec rspec` and `cd isq && bundle exec rspec`
2. Create `bin/export`
3. Test all scripts
