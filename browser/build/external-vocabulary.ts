// External vocabulary metadata for stub entity generation.
// Maps referenced qnames to their type and description for entities
// that appear in references but are not defined in our ontologies.

export interface ExternalMetaEntry {
  type: string
  description: string
}

export const externalMeta: Record<string, ExternalMetaEntry> = {
  'rdf:type': { type: 'annotationProperty', description: 'The type of the subject resource.' },
  'rdf:value': { type: 'datatypeProperty', description: 'The value of the subject resource.' },
  'rdf:langString': { type: 'class', description: 'The class of RDF language-tagged string literals.' },
  'dcterms:title': { type: 'annotationProperty', description: 'A name given to the resource.' },
  'dcterms:description': { type: 'annotationProperty', description: 'An account of the resource.' },
  'dcterms:identifier': { type: 'annotationProperty', description: 'An unambiguous reference to the resource.' },
  'dcterms:isPartOf': { type: 'objectProperty', description: 'A related resource in which the described resource is physically or logically included.' },
  'dcterms:hasVersion': { type: 'objectProperty', description: 'A related resource that is a version, edition, or adaptation of the described resource.' },
  'dcterms:format': { type: 'annotationProperty', description: 'The file format, physical medium, or dimensions of the resource.' },
  'dcterms:issued': { type: 'annotationProperty', description: 'Date of formal issuance of the resource.' },
  'dcterms:replaces': { type: 'objectProperty', description: 'A related resource that is supplanted, displaced, or superseded by the described resource.' },
  'skos:prefLabel': { type: 'annotationProperty', description: 'The preferred lexical label for a resource.' },
  'skos:altLabel': { type: 'annotationProperty', description: 'An alternative lexical label for a resource.' },
  'skos:definition': { type: 'annotationProperty', description: 'A complete explanation of the intended meaning of a concept.' },
  'skos:notation': { type: 'annotationProperty', description: 'A notation is a string of characters used to uniquely identify a concept.' },
  'skos:note': { type: 'annotationProperty', description: 'A general note about a concept.' },
  'skos:scopeNote': { type: 'annotationProperty', description: 'A note that helps to clarify the meaning and/or the use of a concept.' },
  'skos:changeNote': { type: 'annotationProperty', description: 'A note about a modification to a concept.' },
  'skosxl:prefLabel': { type: 'objectProperty', description: 'Relates a resource to its preferred label as a skosxl:Label instance.' },
  'skosxl:altLabel': { type: 'objectProperty', description: 'Relates a resource to an alternative label as a skosxl:Label instance.' },
  'skosxl:literalForm': { type: 'datatypeProperty', description: 'The literal form of a skosxl:Label.' },
  'xsd:string': { type: 'class', description: 'The class of XML Schema string values.' },
  'xsd:date': { type: 'class', description: 'The class of XML Schema date values.' },
  'sh:IRI': { type: 'class', description: 'A SHACL node kind indicating the value must be an IRI.' },
  'sh:BlankNodeOrIRI': { type: 'class', description: 'A SHACL node kind indicating the value must be a blank node or IRI.' },
  'oa:hasBody': { type: 'objectProperty', description: 'The body of the annotation.' },
  'oa:hasTarget': { type: 'objectProperty', description: 'The target of the annotation.' },
  'oa:hasSelector': { type: 'objectProperty', description: 'The selector of an OA SpecificResource.' },
  'oa:hasSource': { type: 'objectProperty', description: 'The source resource of an OA SpecificResource.' },
  'dcat:distribution': { type: 'objectProperty', description: 'An available distribution of the dataset.' },
  'prov:entity': { type: 'objectProperty', description: 'The entity referenced by a prov:Derivation.' },
  'prov:qualifiedDerivation': { type: 'objectProperty', description: 'A qualified derivation relationship.' },
  'smart:hasSectionNumber': { type: 'datatypeProperty', description: 'The section number of a clause within a document.' },
  'smart:deprecatedLabel': { type: 'annotationProperty', description: 'A deprecated label for an entity.' },
}
