# frozen_string_literal: true

module SmartSdu
  class TermEntry < Entity
    attribute :bindingness_type, :string
    attribute :is_part_of, :string

    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                Lutaml::Rdf::Namespaces::DctermsNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:TermEntry"

      predicate :hasBindingnessType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :bindingness_type

      predicate :isPartOf,
                namespace: Lutaml::Rdf::Namespaces::DctermsNamespace,
                to: :is_part_of
    end
  end
end
