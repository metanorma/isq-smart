# frozen_string_literal: true

module SmartSdu
  class Organization < Agent
    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:Organization"
    end
  end
end
