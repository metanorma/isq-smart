# Release Notes

## Overview of 2.0.0

This is the 2.0.0 release of the Information Model for SMART content from the IEC and ISO Single Delivery Unit. It is mainly made of:

* a Core Ontology focusing mainly on representing the types of Provision and Term entry as per the [ISO](https://www.iso.org/resources/publicly-available-resources.html?t=2GjwAG0y1pTGaWMLrFyd8JcnY2jv_ZM8-53tGT1-6f5uPDmC2DinHt5OHGv4uZf7&view=documents#section-isodocuments-top)/[IEC](https://www.iec.ch/standards-development/isoiec-directives-part-2) Directives Part 2
* a set of 7 SKOS taxonomies defining concepts for categorising for the following types of Entity
* a set of W3C SHACL schema aimed at defining constraints on allowed properties and corresponding values for entity types

The Information Model [browser](https://smartsdu.bitbucket.io/docs/im/browse/) can be used to explore the model in full including more detailed [metrics](https://smartsdu.bitbucket.io/docs/im/browse/statistics.html) about its content.

The following figure gives a selected view of the Information Model showing its main entity types along with their relationships (without cardinalities) and attributes.

??? info

    This figure is not a UML diagram.

![Information Model Overview](../assets/images/overview-im.png)

### Open License
This release introduces CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/) as a license.


### Editorial Note

This version 2.0.0 is built from an IEC/ISO Core Ontology v1 while introducing significant changes based on different design choices. The IEC/ISO Core Ontology v1 was built from the SIM ontology which were developed by the IEC SG12 SIM group.

### Core Ontology

The Core Ontology focusing mainly on representing the types of Provision and Term entry as per the [ISO](https://www.iso.org/resources/publicly-available-resources.html?t=2GjwAG0y1pTGaWMLrFyd8JcnY2jv_ZM8-53tGT1-6f5uPDmC2DinHt5OHGv4uZf7&view=documents#section-isodocuments-top)/[IEC](https://www.iec.ch/standards-development/isoiec-directives-part-2) Directives Part 2. This Core Ontology also model some of the Provision aspects including for example:

* whether a Provision is normative or informative (its bindingness type), 
* the PublicationDocument (e.g. International Standard) it is part of and its precise location in it, 
* supplementary elements (notes, examples, figures, etc.) that are associated with it. 
    
More use cases can be found in the [Competency Questions](../Competency%20Questions.md) section.

### Taxonomies

A set of 7 SKOS taxonomies defining concepts for categorising for the following types of Entity:

    * Provision
         * ProvisionType (provision-type.ttl)
         * BindingnessType (bindingness-type.ttl)
         * PublicationComponentType (publication-component-type.ttl)

    * ProvisionSupplement
         * ProvisionSupplementType (provision-supplement-type.ttl)

    * PublicationDocument
         * PublicationDocumentType (publication-type.ttl)

    * Term Entry and Term
         * Part Of Speech (part-of-speech-type.ttl)
         * term-form-type (term-form-type.ttl)


## Addition of new Ontology resources

### Selected Added Classes

* Flat [Provision type hierarchy](https://smartsdu.bitbucket.io/docs/im/browse/smartprovision.html)
* PublicationDocument: bringing into the Core Ontology Document types as defined in the Directives part 2.
* Entity, Agent, Activity: these 3 classes are equivalent to respectively the W3C PROV-O prov:Entity, prov:Agent and prov:Activity. The goal of this introduction is to lay the foundation for provenance and traceability representation of Provision, their production and usage.
* ProvisionType, ProvisionSupplementType, PublicationDocumentType, PublicationComponentType, BindingnessType


### Selected Added Object Properties

* hasPart, isPartOf: e.g. to link a Standard with the clauses, provisions and term entries it is made of. These properties also link clauses with the provisions they contain.
* hasSupplementType, hasPublicationComponentType, hasPublicationType: respectively associate a ProvisionSupplement, Provision or ProvisionSupplement and a PublicationDocument to their caterogies from a SKOS taxonomy.


## Deprecated Ontology resource

Deprecation of an Ontology resource (Class, Object Property, Data Property, Annotation Property, Individual), is signaled with the boolean True as value of the owl:deprecated propery. The following example detailed the now deprecated smart:Content class. 

``` turtle
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix core: <https://w3id.org/standards/smart/ontologies/core#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix skos: <http://www.w3.org/2004/02/skos/core#> .
    core:Content rdf:type owl:Class ;
             rdfs:label "DEPRECATED Content"@en ;
             rdfs:seeAlso "https://w3id.org/standards/smart/taxonomies/publication-component-type/"@en ;
             owl:deprecated "true"^^xsd:boolean ;
             skos:definition "DEPRECATED The actual information provided by a provision"@en ;
             skos:editorialNote """The Content class has a mix of data structure (e.g. Table) and format (e.g. MathML) as subclasses. That makes its meaining not clear. It looks like it is an attempt to define part of the publication content components as introduced by the directives part 2 (https://www.iec.ch/standards-development/isoiec-directives-part-2#article-header-id-5629-text-components). Furthemore, many more types of components can be found within a publication hinting that a taxonomy is more fitted that a flat class hierarchy in this case. Publication content Component types are now defined as skos taxonomy (see publication-component-type.ttl taxonomy). They can be associated with a ProvisionSupplement or a Provision using the property hasPublicationComponentType."""@en .
```

Each deprecated Ontology resource will hold information about:

* Another resource to replace it using dcterms:isReplacedBy if relevant
* The reason of the deprecation using skos:editorialNote

Ontology resources deprecated from Core Ontology v1 can be found in the information_model/ontologies/deprecated directory.


## Bug Fixes

Using the Core Ontology v1, one can infer that the Class ‘Provision’ is ‘EquivalentTo’ to the Class ‘Provision Supplement’ because of domain definition of the hasBindingnessType property which were equal to ‘Provision‘ and ‘ProvisionSupplement’. This release solved that issue by using an 'or' instead of 'and' and by also adding satisfiability and consistent tests to the entire Information Model.
