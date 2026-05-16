from pathlib import Path

from tests.testing_functions import run_query

TEST_DIR = Path(__file__).parent


def _optional_string(row_values, name):
    value = row_values.get(name)
    if value is None:
        return None
    return str(value)


def test_cq_data_sample():
    """
    Ensure that the sample document data can reply to reconstruction queries.
    """
    results = list(run_query(TEST_DIR / "document_sample.ttl", TEST_DIR / "cq_query.sparql"))

    normalized_results = [
        {
            "depth": row.depth.toPython(),
            "type": str(row.type),
            "item": str(row.item),
            "parent": str(row.parent),
            "previous": _optional_string(row.asdict(), "previous"),
            "next": _optional_string(row.asdict(), "next"),
            "annotation": str(row.annotation),
            "target": str(row.target),
            "section": _optional_string(row.asdict(), "section"),
            "title": _optional_string(row.asdict(), "title"),
            "value": _optional_string(row.asdict(), "value"),
        }
        for row in results
    ]

    expected_results = [
        {
            "depth": 1,
            "type": "https://w3id.org/standards/smart/ontologies/core/Clause",
            "item": "https://example.org/forword",
            "parent": "https://example.org/document_1",
            "previous": None,
            "next": "https://example.org/introduction",
            "annotation": "https://example.org/annotation_9",
            "target": "https://example.org/content_fragment_9",
            "section": "1",
            "title": "FORWORD",
            "value": None,
        },
        {
            "depth": 1,
            "type": "https://w3id.org/standards/smart/ontologies/core/Clause",
            "item": "https://example.org/introduction",
            "parent": "https://example.org/document_1",
            "previous": "https://example.org/forword",
            "next": "https://example.org/technical_specification",
            "annotation": "https://example.org/annotation_10",
            "target": "https://example.org/content_fragment_10",
            "section": "2",
            "title": "INTRODUCTION",
            "value": None,
        },
        {
            "depth": 1,
            "type": "https://w3id.org/standards/smart/ontologies/core/Clause",
            "item": "https://example.org/technical_specification",
            "parent": "https://example.org/document_1",
            "previous": "https://example.org/introduction",
            "next": None,
            "annotation": "https://example.org/annotation_11",
            "target": "https://example.org/content_fragment_11",
            "section": "3",
            "title": "Technical Specification",
            "value": None,
        },
        {
            "depth": 2,
            "type": "https://w3id.org/standards/smart/ontologies/core/Provision",
            "item": "https://example.org/prov1",
            "parent": "https://example.org/forword",
            "previous": None,
            "next": "https://example.org/prov2",
            "annotation": "https://example.org/annotation_1",
            "target": "https://example.org/content_fragment_1",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
            "depth": 2,
            "type": "https://w3id.org/standards/smart/ontologies/core/Provision",
            "item": "https://example.org/prov2",
            "parent": "https://example.org/forword",
            "previous": "https://example.org/prov1",
            "next": None,
            "annotation": "https://example.org/annotation_2",
            "target": "https://example.org/content_fragment_2",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
            "depth": 2,
            "type": "https://w3id.org/standards/smart/ontologies/core/Requirement",
            "item": "https://example.org/prov3",
            "parent": "https://example.org/introduction",
            "previous": None,
            "next": "https://example.org/prov4",
            "annotation": "https://example.org/annotation_3",
            "target": "https://example.org/content_fragment_3",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
            "depth": 2,
            "type": "https://w3id.org/standards/smart/ontologies/core/Provision",
            "item": "https://example.org/prov4",
            "parent": "https://example.org/introduction",
            "previous": "https://example.org/prov3",
            "next": None,
            "annotation": "https://example.org/annotation_4",
            "target": "https://example.org/content_fragment_4",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
            "depth": 2,
            "type": "https://w3id.org/standards/smart/ontologies/core/Requirement",
            "item": "https://example.org/prov5",
            "parent": "https://example.org/technical_specification",
            "previous": None,
            "next": "https://example.org/technical_detail",
            "annotation": "https://example.org/annotation_5",
            "target": "https://example.org/content_fragment_5",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
            "depth": 2,
            "type": "https://w3id.org/standards/smart/ontologies/core/Clause",
            "item": "https://example.org/technical_detail",
            "parent": "https://example.org/technical_specification",
            "previous": "https://example.org/prov5",
            "next": None,
            "annotation": "https://example.org/annotation_12",
            "target": "https://example.org/content_fragment_12",
            "section": "3.1",
            "title": "Technical Detail",
            "value": None,
        },
        {
            "depth": 3,
            "type": "https://w3id.org/standards/smart/ontologies/core/Requirement",
            "item": "https://example.org/prov6",
            "parent": "https://example.org/technical_detail",
            "previous": None,
            "next": "https://example.org/prov7",
            "annotation": "https://example.org/annotation_6",
            "target": "https://example.org/content_fragment_6",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
            "depth": 3,
            "type": "https://w3id.org/standards/smart/ontologies/core/Requirement",
            "item": "https://example.org/prov7",
            "parent": "https://example.org/technical_detail",
            "previous": "https://example.org/prov6",
            "next": "https://example.org/prov8",
            "annotation": "https://example.org/annotation_7",
            "target": "https://example.org/content_fragment_7",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
            "depth": 3,
            "type": "https://w3id.org/standards/smart/ontologies/core/Requirement",
            "item": "https://example.org/prov8",
            "parent": "https://example.org/technical_detail",
            "previous": "https://example.org/prov7",
            "next": None,
            "annotation": "https://example.org/annotation_8",
            "target": "https://example.org/content_fragment_8",
            "section": None,
            "title": None,
            "value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
    ]

    assert normalized_results == expected_results
