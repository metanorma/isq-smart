import json
from collections import defaultdict
from pathlib import Path

from rdflib import Graph, Namespace, RDF


EX = Namespace("https://example.org/")
SMART = Namespace("https://w3id.org/standards/smart/ontologies/core/")
DCTERMS = Namespace("http://purl.org/dc/terms/")

ROOT = EX.document_1
SAMPLE_PATH = Path(__file__).with_name("document_sample.ttl")
QUERY_PATH = Path(__file__).with_name("cq_query.sparql")


def compact_uri(uri):
    text = str(uri)
    if text.startswith(str(EX)):
        return f"ex:{text.removeprefix(str(EX))}"
    if text.startswith(str(SMART)):
        return f"smart:{text.removeprefix(str(SMART))}"
    return text


def binding_value(binding, name):
    value = binding.get(name)
    if value is None:
        return None
    return value["value"]


def quoted_text(value):
    if value is None:
        return None
    return json.dumps(str(value), ensure_ascii=False)


def load_query_json(graph, query_path):
    query = query_path.read_text(encoding="utf-8")
    results = graph.query(query)
    return json.loads(results.serialize(format="json"))


def rows_from_json(query_json):
    rows = []
    for binding in query_json["results"]["bindings"]:
        rows.append(
            {
                "item": binding_value(binding, "item"),
                "parent": binding_value(binding, "parent"),
                "type": binding_value(binding, "type"),
                "depth": int(binding_value(binding, "depth")),
                "previous": binding_value(binding, "previous"),
                "next": binding_value(binding, "next"),
                "title": binding_value(binding, "title"),
                "value": binding_value(binding, "value"),
            }
        )
    return rows


def order_siblings(rows):
    by_item = {row["item"]: row for row in rows}
    heads = [row for row in rows if not row["previous"] or row["previous"] not in by_item]

    ordered = []
    visited = set()

    for head in sorted(heads, key=lambda row: row["item"]):
        current = head
        while current and current["item"] not in visited:
            ordered.append(current)
            visited.add(current["item"])
            current = by_item.get(current["next"])

    ordered.extend(
        sorted((row for row in rows if row["item"] not in visited), key=lambda row: row["item"])
    )

    return ordered


def children_by_parent(rows):
    grouped = defaultdict(list)
    for row in rows:
        grouped[row["parent"]].append(row)
    return {parent: order_siblings(children) for parent, children in grouped.items()}


def row_text(row):
    class_name = compact_uri(row["type"]).split(":")[-1]
    if class_name == "Clause":
        return row["title"]
    return row["value"]


def item_label(item, item_type, text=None):
    label_parts = [compact_uri(item_type)]
    quoted = quoted_text(text)
    if quoted:
        label_parts.append(quoted)
    return f"{compact_uri(item)} [{', '.join(label_parts)}]"


def print_tree(parent, grouped, prefix=""):
    children = grouped.get(str(parent), [])
    for index, child in enumerate(children):
        is_last = index == len(children) - 1
        connector = "`-- " if is_last else "|-- "
        child_label = item_label(child["item"], child["type"], row_text(child))
        print(f"{prefix}{connector}{child_label}")

        extension = "    " if is_last else "|   "
        print_tree(child["item"], grouped, prefix + extension)


def main():
    graph = Graph()
    graph.parse(SAMPLE_PATH, format="turtle")

    query_json = load_query_json(graph, QUERY_PATH)
    rows = rows_from_json(query_json)
    grouped = children_by_parent(rows)

    root_type = graph.value(ROOT, RDF.type)
    root_title = graph.value(ROOT, DCTERMS.title)
    print(item_label(ROOT, root_type, root_title))
    print_tree(ROOT, grouped)


if __name__ == "__main__":
    main()
