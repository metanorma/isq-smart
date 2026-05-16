from rdflib import Graph
from information_model.assets import as_path, exists, read_text

CORE_ONTOLOGY = "ontologies/core-ontology.ttl"


def test_core_ontology_exists():
    """
    Ensure the main ontology file is packaged and reachable.
    """
    assert exists(CORE_ONTOLOGY)


def test_core_ontology_is_not_empty():
    """
    Ensure the ontology file contains content.
    """
    content = read_text(CORE_ONTOLOGY)
    assert len(content.strip()) > 0


def test_core_ontology_accessible_as_path():
    """
    Ensure we can obtain a real filesystem path (required by many RDF libraries).
    """
    with as_path(CORE_ONTOLOGY) as path:
        assert path.exists()
        assert path.is_file()


def test_core_ontology_parses():
    """
    Ensure the ontology file can be parsed by RDFLib.
    """
    with as_path(CORE_ONTOLOGY) as path:
        g = Graph()
        g.parse(path, format="turtle")
        assert len(g) > 0