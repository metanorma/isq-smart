# frozen_string_literal: true

module SmartSdu
  module Taxonomy
    class TermFormType < Lutaml::Model::Serializable
      attribute :label, :string

      VALUES = %w[abbreviation acronym equation formula fullForm symbol variant].freeze

      rdf do
        namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                  Lutaml::Rdf::Namespaces::SkosNamespace

        subject { |m| "https://w3id.org/standards/smart/taxonomies/term-form-type/#{m.label}" }

        type "smart:TermFormType"

        predicate :prefLabel,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :label
      end
    end
  end
end
