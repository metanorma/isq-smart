from pathlib import Path
from information_model.assets import as_path, exists
from tests.testing_functions import run_query

CORE_ONTOLOGY = "ontologies/core-ontology.ttl"
ANNOTATION_ONTOLOGY = "ontologies/external/vocabulary.ttl"
TEST_DIR = Path(__file__).parent


def test_ANNOTATION_ONTOLOGY_exists():
    """
    Ensure the OA-profile ontology file is packaged and reachable.
    """
    assert exists(ANNOTATION_ONTOLOGY)


def test_cq_data_sample():
    """
    Ensure that the sample data can reply to competency questions
    """
    results = list(run_query(TEST_DIR / "annotations_sample.ttl", TEST_DIR / "cq_query.sparql"))

    normalized_results = [
        {
            "provision": str(row.provision),
            "authoritative_file": str(row.authoritative_file),
            "fragment_selector_type": str(row.fragment_selector_type),
            "fragment_selector": str(row.fragment_selector),
            "checksum_match": row.checksum_match.toPython(),
        }
        for row in results
    ]

    expected_results = [
        {
            "provision": "https://example.org/provision_1",
            "authoritative_file": "https://example.org/iso_std_iso_9000_ed_2_v2",
            "fragment_selector_type": "http://www.w3.org/ns/oa#XPathSelector",
            "fragment_selector": "/standard/body/sec[4]/sec[1]/p[1]/text()",
            "checksum_match": True,
        }
    ]

    assert normalized_results == expected_results


def test_core_ontology_validity():
    """
    Validate that class smart:PublicationDocument exists in the ontology.
    """

    sparql = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX smart: <https://w3id.org/standards/smart/ontologies/core/>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        ASK {
            smart:PublicationDocument rdf:type owl:Class .
        }    
    """

    with as_path(CORE_ONTOLOGY) as path:
        result = run_query(path, sparql)

    answer = bool(result.askAnswer)

    assert answer is True
