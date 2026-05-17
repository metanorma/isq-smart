# Parameterize GHA workflow for data source repos

## Current state
`.github/workflows/build.yml` hardcodes `repository: metanorma/iso-iec-80000`.

## Target
- Make the data source repo configurable via workflow input or environment variable
- Handle the case where the repo is private (needs token)
- Consider also cloning UnitsML/unitsdb if needed for full build
- Add a Ruby job that runs specs for both gems

## How to apply
1. Add `workflow_dispatch` with `inputs` for repo URL and ref
2. Use `secrets` for private repo access if needed
3. Add a `ruby` job: `cd smart-sdu && bundle install && bundle exec rspec`
4. Add an `isq-export` job: `cd isq && bundle install && bundle exec rake export:all`
5. Browser build depends on these
