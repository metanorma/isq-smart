# frozen_string_literal: true

require_relative "lib/smart_sdu/version"

Gem::Specification.new do |spec|
  spec.name = "smart_sdu"
  spec.version = SmartSdu::VERSION
  spec.authors = ["Ribose"]
  spec.email = ["open.source@ribose.com"]

  spec.summary = "Lutaml-model classes for the SmartSDU (IEC-ISO) Core Ontology information model."
  spec.license = "BSD-2-Clause"
  spec.required_ruby_version = Gem::Requirement.new(">= 3.0.0")

  spec.metadata["homepage_uri"] = "https://github.com/metanorma/sdu-smart"
  spec.metadata["source_code_uri"] = spec.metadata["homepage_uri"]

  spec.files = Dir.glob("lib/**/*.rb")
  spec.bindir = "exe"
  spec.executables = []
  spec.require_paths = ["lib"]

  spec.add_dependency "lutaml-model", "~> 0.8.0"
  spec.metadata["rubygems_mfa_required"] = "true"
end
