# frozen_string_literal: true

module SmartSdu
  module Taxonomy
    class PublicationDocumentType < Lutaml::Model::Serializable
      attribute :label, :string

      VALUES = %w[
        guide publiclyAvailableSpecification technicalReport
        technicalSpecification normativeDocument standard
        internationalStandard
      ].freeze

      rdf do
        namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                  Lutaml::Rdf::Namespaces::SkosNamespace

        subject { |m| "https://w3id.org/standards/smart/taxonomies/publication-type/#{m.label}" }

        type "smart:PublicationDocumentType"

        predicate :prefLabel,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :label
      end
    end
  end
end
