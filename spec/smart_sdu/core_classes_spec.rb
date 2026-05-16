# frozen_string_literal: true

RSpec.describe SmartSdu do
  describe "core class hierarchy" do
    it "Entity inherits from Lutaml::Model::Serializable" do
      expect(SmartSdu::Entity < Lutaml::Model::Serializable).to be true
    end

    it "Provision inherits from Entity" do
      expect(SmartSdu::Provision < SmartSdu::Entity).to be true
    end

    it "Clause inherits from ProvisionSet" do
      expect(SmartSdu::Clause < SmartSdu::ProvisionSet).to be true
    end

    it "ProvisionSet inherits from Entity" do
      expect(SmartSdu::ProvisionSet < SmartSdu::Entity).to be true
    end

    it "Organization inherits from Agent" do
      expect(SmartSdu::Organization < SmartSdu::Agent).to be true
    end

    it "Agent inherits from Entity" do
      expect(SmartSdu::Agent < SmartSdu::Entity).to be true
    end
  end

  describe "provision subtypes" do
    before { SmartSdu::Provision }
    {
      Statement: "smart:Statement",
      Instruction: "smart:Instruction",
      Recommendation: "smart:Recommendation",
      Requirement: "smart:Requirement",
      Permission: "smart:Permission",
      Capability: "smart:Capability",
      Possibility: "smart:Possibility",
      ExternalConstraint: "smart:ExternalConstraint",
    }.each do |klass, type|
      it "#{klass} inherits from Provision" do
        expect(SmartSdu.const_get(klass) < SmartSdu::Provision).to be true
      end

      it "#{klass} serializes to Turtle with correct rdf:type" do
        instance = SmartSdu.const_get(klass).new(id: "test-#{klass.to_s.gsub(/(.)([A-Z])/, '\1-\2').downcase}")
        turtle = instance.to_turtle
        expect(turtle).to include("a #{type}")
      end
    end
  end

  describe "Turtle serialization" do
    it "PublicationDocument generates correct Turtle" do
      doc = SmartSdu::PublicationDocument.new(
        id: "iso-80000-1",
        publication_type: "internationalStandard",
        issued: "2022",
      )
      turtle = doc.to_turtle
      expect(turtle).to include("a smart:PublicationDocument")
      expect(turtle).to include("smart:hasPublicationType")
      expect(turtle).to include("dcterms:issued")
    end

    it "Clause generates correct Turtle" do
      clause = SmartSdu::Clause.new(
        id: "clause-4",
        title: "Quantities",
        section_number: "4",
        bindingness_type: "normative",
      )
      turtle = clause.to_turtle
      expect(turtle).to include("a smart:Clause")
      expect(turtle).to include("smart:hasBindingnessType")
      expect(turtle).to include("dcterms:title")
    end

    it "Term generates correct Turtle" do
      term = SmartSdu::Term.new(
        id: "term-length",
        pronunciation: "lengθ",
        term_form_type: "fullForm",
      )
      turtle = term.to_turtle
      expect(turtle).to include("a smart:Term")
      expect(turtle).to include("smart:pronunciation")
      expect(turtle).to include("smart:hasTermFormType")
    end

    it "TermEntry generates correct Turtle" do
      entry = SmartSdu::TermEntry.new(
        id: "term-entry-3-1-1",
        bindingness_type: "normative",
      )
      turtle = entry.to_turtle
      expect(turtle).to include("a smart:TermEntry")
      expect(turtle).to include("smart:hasBindingnessType")
    end

    it "ProvisionSupplement generates correct Turtle" do
      sup = SmartSdu::ProvisionSupplement.new(
        id: "note-3-1",
        supplement_type: "note",
      )
      turtle = sup.to_turtle
      expect(turtle).to include("a smart:ProvisionSupplement")
      expect(turtle).to include("smart:hasSupplementType")
    end
  end

  describe "taxonomy types" do
    it "BindingnessType generates correct Turtle" do
      bt = SmartSdu::Taxonomy::BindingnessType.new(label: "normative")
      turtle = bt.to_turtle
      expect(turtle).to include("a smart:BindingnessType")
      expect(turtle).to include("skos:prefLabel")
    end

    it "ProvisionType generates correct Turtle" do
      pt = SmartSdu::Taxonomy::ProvisionType.new(label: "governingProvision")
      turtle = pt.to_turtle
      expect(turtle).to include("a smart:ProvisionType")
    end

    it "all taxonomy types have VALUES constants" do
      expect(SmartSdu::Taxonomy::BindingnessType::VALUES).to eq(%w[normative informative])
      expect(SmartSdu::Taxonomy::ProvisionType::VALUES).to eq(%w[governingProvision assertionalProvision])
      expect(SmartSdu::Taxonomy::PublicationComponentType::VALUES).to eq(%w[code figure mathematicalFormula table textual])
      expect(SmartSdu::Taxonomy::ProvisionSupplementType::VALUES).to eq(%w[example footnote note])
      expect(SmartSdu::Taxonomy::PartOfSpeechType::VALUES).to eq(%w[adjective adverb noun verb])
      expect(SmartSdu::Taxonomy::TermFormType::VALUES).to eq(%w[abbreviation acronym equation formula fullForm symbol variant])
    end
  end

  describe "Turtle round-trip" do
    it "round-trips PublicationDocument" do
      doc = SmartSdu::PublicationDocument.new(
        id: "iso-80000-3",
        publication_type: "internationalStandard",
        issued: "2019",
      )
      turtle = doc.to_turtle
      restored = SmartSdu::PublicationDocument.from_turtle(turtle)
      expect(restored.publication_type).to eq("internationalStandard")
      expect(restored.issued).to eq("2019")
    end
  end
end
