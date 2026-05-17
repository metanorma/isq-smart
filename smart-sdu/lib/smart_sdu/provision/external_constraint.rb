# frozen_string_literal: true

module SmartSdu
  class ExternalConstraint < Provision
    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:ExternalConstraint"
    end
  end
end
