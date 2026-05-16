from pathlib import Path
from typing import Union

from rdflib import Graph


def run_query(ontology_path: Path, query: Union[str, Path], rdf_format: str = "turtle"):
    graph = Graph()
    graph.parse(ontology_path, format=rdf_format)

    if isinstance(query, Path):
        with open(query, encoding="utf-8") as file:
            query = file.read()

    return graph.query(query)
