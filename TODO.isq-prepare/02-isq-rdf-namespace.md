# Wire isq gem to depend on smart-sdu

## Current state
Both gems share `SmartSdu` as a namespace. The isq classes inherit from
`SmartSdu::TermEntry` and `SmartSdu::Entity` which live in the `smart-sdu` gem.

## Target
- `isq/Gemfile` should point to `smart-sdu` gem via path: `gem "smart_sdu", path: "../smart-sdu"`
- isq's `lib/isq.rb` (or current entry point) should `require "smart_sdu"`
- `isq/lib/tasks/export.rake` references `SmartSdu::VERSION` and core classes — verify requires

## How to apply
1. Update `isq/Gemfile` with path dependency
2. Add `require "smart_sdu"` to isq entry point
3. Run `cd isq && bundle install && bundle exec rspec`
4. Run `cd isq && bundle exec rake export:all` to verify export task
