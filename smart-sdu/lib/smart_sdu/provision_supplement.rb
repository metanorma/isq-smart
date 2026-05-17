# frozen_string_literal: true

module SmartSdu
  class ProvisionSupplement < Entity
    attribute :supplement_type, :string
    attribute :bindingness_type, :string
    attribute :publication_component_type, :string

    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:ProvisionSupplement"

      predicate :hasSupplementType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :supplement_type

      predicate :hasBindingnessType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :bindingness_type

      predicate :hasPublicationComponentType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :publication_component_type
    end
  end
end
