# frozen_string_literal: true

require_relative "lib/sdu_smart/version"

Gem::Specification.new do |spec|
  spec.name = "sdu_smart"
  spec.version = SduSmart::VERSION
  spec.authors = ["Ribose"]
  spec.email = ["open.source@ribose.com"]

  spec.summary = "ISO/IEC 80000 International System of Quantities — Ruby domain classes and RDF export."
  spec.license = "BSD-2-Clause"
  spec.required_ruby_version = Gem::Requirement.new(">= 3.0.0")

  spec.metadata["homepage_uri"] = "https://github.com/metanorma/sdu-smart"
  spec.metadata["source_code_uri"] = spec.metadata["homepage_uri"]

  spec.files = Dir.glob("lib/**/*.rb") + Dir.glob("lib/tasks/*.rake")
  spec.require_paths = ["lib"]

  spec.add_dependency "smart_sdu", "~> 0.1.0"
  spec.add_dependency "lutaml-model", "~> 0.8.0"
  spec.metadata["rubygems_mfa_required"] = "true"
end
