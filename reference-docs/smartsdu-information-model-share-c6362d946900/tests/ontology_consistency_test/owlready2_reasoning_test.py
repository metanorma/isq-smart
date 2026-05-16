from __future__ import annotations

import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import owlready2
import pytest
from owlready2 import PREDEFINED_ONTOLOGIES, OwlReadyInconsistentOntologyError, World, sync_reasoner_hermit
from rdflib import Graph

from information_model.assets import as_path, resource

# LOCAL_IMPORT_MAPPINGS = {
#     "https://w3id.org/standards/smart/ontologies/tbx#": "ontologies/TBX-ontology.ttl",
# }


@dataclass(frozen=True)
class ConsistencyCheckResult:
    ontology_path: str
    ontology_inconsistent: bool
    unsatisfiable_classes: tuple[tuple[str, tuple[str, ...]], ...]


def java_available() -> bool:
    java_executable = shutil.which("java")
    if not java_executable:
        return False

    try:
        subprocess.run(
            [java_executable, "-version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
    except (OSError, subprocess.SubprocessError):
        return False

    return True


def _serialize_turtle_as_ntriples(relative_path: str, destination: Path) -> Path:
    graph = Graph()
    with as_path(relative_path) as path:
        graph.parse(path, format="turtle")
    destination.write_text(graph.serialize(format="ntriples"), encoding="utf-8")
    return destination


def _class_name(entity) -> str:
    return getattr(entity, "name", None) or str(entity)


def _ontology_paths_to_test() -> list[str]:
    ontology_dir = resource("ontologies")
    return sorted(
        f"ontologies/{entry.name}"
        for entry in ontology_dir.iterdir()
        if entry.is_file() and entry.name.endswith(".ttl")
    )


def _class_context(cls) -> tuple[str, ...]:
    details: list[str] = []

    is_a_items = sorted({_class_name(parent) for parent in getattr(cls, "is_a", [])}, key=str)
    equivalent_items = sorted({_class_name(item) for item in getattr(cls, "equivalent_to", [])}, key=str)

    if is_a_items:
        details.append(f"superclasses / restrictions: {', '.join(is_a_items)}")
    if equivalent_items:
        details.append(f"equivalent_to: {', '.join(equivalent_items)}")

    return tuple(details)


def _format_result(result: ConsistencyCheckResult) -> str:
    lines = [
        f"Owlready2 / HermiT consistency report for {result.ontology_path}",
        "",
    ]

    if result.ontology_inconsistent:
        lines.append("HermiT reported that the ontology is inconsistent.")
        lines.append("")

    if result.unsatisfiable_classes:
        lines.append("Unsatisfiable classes detected:")
        for class_name, context in result.unsatisfiable_classes:
            lines.append(f"- {class_name}")
            for detail in context:
                lines.append(f"  {detail}")
        lines.append("")

    lines.append(
        "Full logical justifications are not exposed by Owlready2's Python API, "
        "so this report includes class context instead of a complete explanation tree."
    )

    return "\n".join(lines)


def run_ontology_consistency_check(
    ontology_path: str,
    *,
    local_imports: dict[str, str] | None = None,
    debug: int = 0,
) -> ConsistencyCheckResult:
    local_imports = local_imports or {}

    with tempfile.TemporaryDirectory(prefix="owlready2_reasoning_") as temp_dir:
        temp_dir_path = Path(temp_dir)
        ontology_ntriples = _serialize_turtle_as_ntriples(ontology_path, temp_dir_path / "ontology.nt")

        import_files: dict[str, Path] = {}
        for index, (import_iri, import_path) in enumerate(local_imports.items(), start=1):
            import_files[import_iri] = _serialize_turtle_as_ntriples(
                import_path,
                temp_dir_path / f"import_{index}.nt",
            )

        previous_mappings = {
            import_iri: PREDEFINED_ONTOLOGIES.get(import_iri)
            for import_iri in local_imports
        }
        for import_iri, import_file in import_files.items():
            PREDEFINED_ONTOLOGIES[import_iri] = import_file.as_uri()

        try:
            owlready2.JAVA_EXE = shutil.which("java") or "java"
            world = World()
            ontology = world.get_ontology(ontology_ntriples.as_uri()).load(format="ntriples")

            ontology_inconsistent = False
            try:
                sync_reasoner_hermit([ontology], debug=debug)
            except OwlReadyInconsistentOntologyError:
                ontology_inconsistent = True

            unsatisfiable_classes = tuple(
                sorted(
                    (
                        (_class_name(cls), _class_context(cls))
                        for cls in world.inconsistent_classes()
                        if _class_name(cls) != "Nothing"
                    ),
                    key=lambda item: item[0],
                )
            )

            return ConsistencyCheckResult(
                ontology_path=ontology_path,
                ontology_inconsistent=ontology_inconsistent,
                unsatisfiable_classes=unsatisfiable_classes,
            )
        finally:
            for import_iri, previous_mapping in previous_mappings.items():
                if previous_mapping is None:
                    PREDEFINED_ONTOLOGIES.pop(import_iri, None)
                else:
                    PREDEFINED_ONTOLOGIES[import_iri] = previous_mapping


def assert_ontology_is_consistent(
    ontology_path: str,
    *,
    local_imports: dict[str, str] | None = None,
    debug: int = 0,
) -> None:
    if not java_available():
        pytest.fail(
            "Java required for Owlready2 reasoner. "
            "Test failed because Java was not found.",
            pytrace=False,
        )

    result = run_ontology_consistency_check(
        ontology_path,
        local_imports=local_imports,
        debug=debug,
    )

    if result.ontology_inconsistent or result.unsatisfiable_classes:
        print(f"\n{_format_result(result)}")
        pytest.fail(
            f"HermiT detected ontology issues in {ontology_path}: "
            f"inconsistent={result.ontology_inconsistent}, "
            f"unsatisfiable_classes={len(result.unsatisfiable_classes)}.",
            pytrace=False,
        )


@pytest.mark.parametrize(
    "ontology_path",
    _ontology_paths_to_test(),
    ids=lambda ontology_path: Path(ontology_path).name,
)
def test_ontology_consistency(ontology_path: str) -> None:
    """
    Run the generic Owlready2/HermiT consistency check for every packaged ontology.

    The local import mapping is shared across all ontologies so known imported IRIs
    can be resolved to packaged local `.ttl` files.
    """
    assert_ontology_is_consistent(
        ontology_path,
        #local_imports=LOCAL_IMPORT_MAPPINGS,
    )
