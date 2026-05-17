# frozen_string_literal: true

module SmartSdu
  module Taxonomy
    class PartOfSpeechType < Lutaml::Model::Serializable
      attribute :label, :string

      VALUES = %w[adjective adverb noun verb].freeze

      rdf do
        namespace SmartSdu::Rdf::Namespaces::SmartNamespace,
                  Lutaml::Rdf::Namespaces::SkosNamespace

        subject { |m| "https://w3id.org/standards/smart/taxonomies/part-of-speech-type/#{m.label}" }

        type "smart:PartOfSpeechType"

        predicate :prefLabel,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :label
      end
    end
  end
end
