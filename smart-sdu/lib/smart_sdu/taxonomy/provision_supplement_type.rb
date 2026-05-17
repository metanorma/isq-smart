# frozen_string_literal: true

module SmartSdu
  module Taxonomy
    class ProvisionSupplementType < Lutaml::Model::Serializable
      attribute :label, :string

      VALUES = %w[example footnote note].freeze

      rdf do
        namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                  Lutaml::Rdf::Namespaces::SkosNamespace

        subject { |m| "https://w3id.org/standards/smart/taxonomies/provision-supplement-type/#{m.label}" }

        type "smart:ProvisionSupplementType"

        predicate :prefLabel,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :label
      end
    end
  end
end
