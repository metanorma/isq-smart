# frozen_string_literal: true

module SmartSdu
  class PublicationDocument < Entity
    attribute :publication_type, :string
    attribute :issued, :string
    attribute :has_version, :string, collection: true
    attribute :replaces, :string

    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                Lutaml::Rdf::Namespaces::DctermsNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:PublicationDocument"

      predicate :hasPublicationType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :publication_type

      predicate :issued,
                namespace: Lutaml::Rdf::Namespaces::DctermsNamespace,
                to: :issued

      predicate :hasVersion,
                namespace: Lutaml::Rdf::Namespaces::DctermsNamespace,
                to: :has_version

      predicate :replaces,
                namespace: Lutaml::Rdf::Namespaces::DctermsNamespace,
                to: :replaces
    end
  end
end
