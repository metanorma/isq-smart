# frozen_string_literal: true

module SmartSdu
  module Taxonomy
    autoload :BindingnessType, "#{__dir__}/taxonomy/bindingness_type"
    autoload :ProvisionType, "#{__dir__}/taxonomy/provision_type"
    autoload :PublicationComponentType, "#{__dir__}/taxonomy/publication_component_type"
    autoload :PublicationDocumentType, "#{__dir__}/taxonomy/publication_document_type"
    autoload :ProvisionSupplementType, "#{__dir__}/taxonomy/provision_supplement_type"
    autoload :PartOfSpeechType, "#{__dir__}/taxonomy/part_of_speech_type"
    autoload :TermFormType, "#{__dir__}/taxonomy/term_form_type"
  end
end
