# frozen_string_literal: true

module SmartSdu
  autoload :Statement, "#{__dir__}/provision/statement"
  autoload :Instruction, "#{__dir__}/provision/instruction"
  autoload :Recommendation, "#{__dir__}/provision/recommendation"
  autoload :Requirement, "#{__dir__}/provision/requirement"
  autoload :Permission, "#{__dir__}/provision/permission"
  autoload :Capability, "#{__dir__}/provision/capability"
  autoload :Possibility, "#{__dir__}/provision/possibility"
  autoload :ExternalConstraint, "#{__dir__}/provision/external_constraint"

  class Provision < Entity
    attribute :bindingness_type, :string
    attribute :provision_type, :string
    attribute :publication_component_type, :string
    attribute :is_part_of, :string
    attribute :has_supplement, :string, collection: true

    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                Lutaml::Rdf::Namespaces::DctermsNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:Provision"

      predicate :hasBindingnessType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :bindingness_type

      predicate :hasProvisionType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :provision_type

      predicate :hasPublicationComponentType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :publication_component_type

      predicate :isPartOf,
                namespace: Lutaml::Rdf::Namespaces::DctermsNamespace,
                to: :is_part_of

      predicate :hasSupplement,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :has_supplement
    end
  end
end
