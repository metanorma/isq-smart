# frozen_string_literal: true

module SmartSdu
  class Term < Entity
    attribute :pronunciation, :string
    attribute :used_in_country, :string
    attribute :part_of_speech_type, :string
    attribute :term_form_type, :string

    rdf do
      namespace SmartSdu::Rdf::Namespaces::SmartNamespace

      subject { |m| "https://w3id.org/standards/smart/ontologies/core/#{m.id}" }

      type "smart:Term"

      predicate :pronunciation,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :pronunciation

      predicate :usedInCountry,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :used_in_country

      predicate :hasPartOfSpeechType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :part_of_speech_type

      predicate :hasTermFormType,
                namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                to: :term_form_type
    end
  end
end
