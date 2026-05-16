from pathlib import Path
from tests.testing_functions import run_query

TEST_DIR = Path(__file__).parent


def test_cq_data_sample():
    """
    Ensure that the sample data can reply to competency questions
    """
    results = list(run_query(TEST_DIR / "terms_sample.ttl", TEST_DIR / "cq_query.sparql"))

    normalized_results = [
        {
            "concept": str(row.concept),
            "definition": str(row.definition),
            "term": str(row.term),
            "language": str(row.language),
            "term_type": str(row.term_type),
            "term_form": str(row.term_form),
            "term_pos": str(row.term_pos),
            "used_in_country": str(row.used_in_country),
        }
        for row in results
    ]

    expected_results = [
        {
            "concept": "https://example.org#concept_x",
            "definition": "use of a product, process or service in accordance with the specifications, instructions and information provided by the manufacturer",
            "term": "intended purpose",
            "language": "en",
            "term_type": "Admitted term",
            "term_form": "https://w3id.org/standards/smart/taxonomies/term-form-type/fullForm",
            "term_pos": "https://w3id.org/standards/smart/taxonomies/part-of-speech-type/noun",
            "used_in_country": "GB",
        },
        {
            "concept": "https://example.org#concept_x",
            "definition": "use of a product, process or service in accordance with the specifications, instructions and information provided by the manufacturer",
            "term": "intended purpose",
            "language": "en",
            "term_type": "Admitted term",
            "term_form": "https://w3id.org/standards/smart/taxonomies/term-form-type/fullForm",
            "term_pos": "https://w3id.org/standards/smart/taxonomies/part-of-speech-type/noun",
            "used_in_country": "US",
        },
        {
            "concept": "https://example.org#concept_x",
            "definition": "use of a product, process or service in accordance with the specifications, instructions and information provided by the manufacturer",
            "term": "intended use",
            "language": "en",
            "term_type": "Preferred term",
            "term_form": "https://w3id.org/standards/smart/taxonomies/term-form-type/fullForm",
            "term_pos": "https://w3id.org/standards/smart/taxonomies/part-of-speech-type/noun",
            "used_in_country": "GB",
        },
        {
            "concept": "https://example.org#concept_x",
            "definition": "use of a product, process or service in accordance with the specifications, instructions and information provided by the manufacturer",
            "term": "intended use",
            "language": "en",
            "term_type": "Preferred term",
            "term_form": "https://w3id.org/standards/smart/taxonomies/term-form-type/fullForm",
            "term_pos": "https://w3id.org/standards/smart/taxonomies/part-of-speech-type/noun",
            "used_in_country": "US",
        },
    ]

    assert normalized_results == expected_results
