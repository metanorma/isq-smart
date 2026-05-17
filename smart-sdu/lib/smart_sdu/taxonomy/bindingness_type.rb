# frozen_string_literal: true

module SmartSdu
  module Taxonomy
    class BindingnessType < Lutaml::Model::Serializable
      attribute :label, :string

      VALUES = %w[normative informative].freeze

      rdf do
        namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                  Lutaml::Rdf::Namespaces::SkosNamespace

        subject { |m| "https://w3id.org/standards/smart/taxonomies/bindingness-type/#{m.label}" }

        type "smart:BindingnessType"

        predicate :prefLabel,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :label
      end
    end
  end
end
