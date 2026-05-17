# frozen_string_literal: true

module SmartSdu
  class Permission < Provision
    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:Permission"
    end
  end
end
