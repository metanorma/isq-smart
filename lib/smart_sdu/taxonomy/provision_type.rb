# frozen_string_literal: true

module SmartSdu
  module Taxonomy
    class ProvisionType < Lutaml::Model::Serializable
      attribute :label, :string

      VALUES = %w[governingProvision assertionalProvision].freeze

      rdf do
        namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                  Lutaml::Rdf::Namespaces::SkosNamespace

        subject { |m| "https://w3id.org/standards/smart/taxonomies/provision-type/#{m.label}" }

        type "smart:ProvisionType"

        predicate :prefLabel,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :label
      end
    end
  end
end
