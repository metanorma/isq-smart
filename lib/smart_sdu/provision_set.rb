# frozen_string_literal: true

module SmartSdu
  class ProvisionSet < Entity
    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:ProvisionSet"
    end
  end
end
