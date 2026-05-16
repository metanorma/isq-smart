# frozen_string_literal: true

module SmartSdu
  module IsoIec80000
    class Unit < TermEntry
      attribute :pref_label, :string
      attribute :notation, :string, collection: true

      rdf do
        namespace SmartSdu::Rdf::Namespaces::IsoIec80000Namespace,
                  SmartSdu::Rdf::Namespaces::SmartNamespace,
                  Lutaml::Rdf::Namespaces::DctermsNamespace,
                  Lutaml::Rdf::Namespaces::SkosNamespace

        subject { |m| "https://w3id.org/standards/isoiec80000/ontologies/core/#{m.id}" }

        type "isoiec80000:Unit"

        predicate :prefLabel,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :pref_label

        predicate :notation,
                  namespace: Lutaml::Rdf::Namespaces::SkosNamespace,
                  to: :notation

        predicate :hasBindingnessType,
                  namespace: SmartSdu::Rdf::Namespaces::SmartNamespace,
                  to: :bindingness_type

        predicate :isPartOf,
                  namespace: Lutaml::Rdf::Namespaces::DctermsNamespace,
                  to: :is_part_of
      end
    end
  end
end
