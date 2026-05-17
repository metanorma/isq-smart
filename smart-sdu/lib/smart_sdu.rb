# frozen_string_literal: true

require "lutaml/model"
require "lutaml/turtle"
require "lutaml/jsonld"

require_relative "smart_sdu/version"

module SmartSdu
  autoload :Entity, "#{__dir__}/smart_sdu/entity"
  autoload :Activity, "#{__dir__}/smart_sdu/activity"
  autoload :Agent, "#{__dir__}/smart_sdu/agent"
  autoload :Organization, "#{__dir__}/smart_sdu/organization"
  autoload :Provision, "#{__dir__}/smart_sdu/provision"
  autoload :ProvisionSet, "#{__dir__}/smart_sdu/provision_set"
  autoload :Clause, "#{__dir__}/smart_sdu/clause"
  autoload :ProvisionSupplement, "#{__dir__}/smart_sdu/provision_supplement"
  autoload :Term, "#{__dir__}/smart_sdu/term"
  autoload :TermEntry, "#{__dir__}/smart_sdu/term_entry"
  autoload :PublicationDocument, "#{__dir__}/smart_sdu/publication_document"
  autoload :Taxonomy, "#{__dir__}/smart_sdu/taxonomy"
  autoload :Rdf, "#{__dir__}/smart_sdu/rdf"
end
