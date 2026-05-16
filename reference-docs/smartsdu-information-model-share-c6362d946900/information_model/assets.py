from __future__ import annotations

from contextlib import contextmanager
from importlib import resources
from pathlib import Path
from typing import Iterator


def resource(relative_path: str) -> resources.abc.Traversable:
    """
    Return a Traversable handle to a packaged resource inside `information_model`.

    Example:
        resource("ontologies/core-ontology.ttl")
    """
    # Normalize to forward slashes; Traversable uses POSIX-like paths.
    rel = relative_path.strip().lstrip("/")

    # Walk segments safely
    node = resources.files("information_model")
    for part in rel.split("/"):
        if part:
            node = node.joinpath(part)
    return node


def exists(relative_path: str) -> bool:
    """Return True if the packaged resource exists."""
    return resource(relative_path).is_file()


def read_text(relative_path: str, encoding: str = "utf-8") -> str:
    """Read a packaged resource as text."""
    return resource(relative_path).read_text(encoding=encoding)


def read_bytes(relative_path: str) -> bytes:
    """Read a packaged resource as bytes."""
    return resource(relative_path).read_bytes()


@contextmanager
def as_path(relative_path: str) -> Iterator[Path]:
    """
    Yield a real filesystem Path to a packaged resource.

    Use this when a library requires a filename/path (e.g., rdflib parsing).
    This is safe even if the package is in a wheel/zip because it will extract
    to a temporary location if needed.

    Example:
        with as_path("ontologies/core-ontology.ttl") as p:
            graph.parse(p)
    """
    traversable = resource(relative_path)

    if not traversable.is_file():
        raise FileNotFoundError(f"Packaged resource not found: {relative_path}")

    with resources.as_file(traversable) as p:
        yield Path(p)


# Convenience helpers for your common folders -------------------------------

def ontology(name: str) -> resources.abc.Traversable:
    """Convenience accessor for `ontology/<name>`."""
    return resource(f"ontologies/{name}")


def shacl(name: str) -> resources.abc.Traversable:
    """Convenience accessor for `schemas/shacl/<name>`."""
    return resource(f"schemas/shacl/{name}")


def example(name: str) -> resources.abc.Traversable:
    """Convenience accessor for `examples/<name>`."""
    return resource(f"examples/{name}")


def doc(name: str) -> resources.abc.Traversable:
    """Convenience accessor for `docs/{name}`."""
    return resource(f"docs/{name}")