# IEC-ISO Core Ontology 

The IEC-ISO Core Ontology defines an OWL data model to represent **fragments** of
SMART **standards** or **contents** in the W3C Resource Description Framework.

## License

The information Model is released under the [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) open license.

## Scope

The Core Ontology allows to describe information and knowledge found in standards, whichever
specific domain of technical or non-technical content. Its scope is intentionally limited to:

- Concepts (classes, properties, and their relations) expressed in the ISO/IEC Directives, Part 2, in particular
  sections 3, 6 & 7.
- Facts that could be extracted automatically as RDF data using technologies developed during the IEC and ISO SMART pilots.
- Narrative (text-based) content and not other forms (figures, equations, tables).

Consequently, the following aspects are **not** modeled in this ontology:

- Modeling of standards' metadata such as document and part number, title, edition, version, publisher and publication date, and various classification schemes such as the ICS, SDGs, etc.
- Addressing to locate standards, or their fragments, on the web or within their source document.
- Presentation such as formatting, layout or typesetting already conveyed in the NISO STS XML schema.
- Modeling of Terms and Definitions is done in a separate OWL ontology that closely maps the TermBase (TBX) schema also used by NISO STS.



## Development Setup Instructions

### 1. Create a Virtual Environment

From the repository root:

``` bash
python -m venv .venv
```

Activate it:

#### macOS / Linux

``` bash
source .venv/bin/activate
```

#### Windows (PowerShell)

``` powershell
.venv\Scripts\Activate.ps1
```

------------------------------------------------------------------------

### 2. Upgrade pip (recommended)

``` bash
python -m pip install --upgrade pip
```

------------------------------------------------------------------------

### 3. Install Packages in Editable Mode

From the repository root:

``` bash
pip install -e .
```

Editable mode (`-e`) ensures:

-   The packages are importable
-   Changes in the source code are immediately reflected
-   No wheel build is required during development

#### Install Optional Dependency Sets (Extras)

The base install:

``` bash
pip install -e .
```

only installs core package dependencies. This project also defines optional
dependency groups in `pyproject.toml`:

- `tests`: testing tools (`pytest`, `pytest-cov`, `rdflib`)
- `docs`: documentation tooling (`zensical`)
- `all`: includes both `docs` and `tests`

Install a specific extra:

``` bash
pip install -e ".[tests]"
```

Install everything:

``` bash
pip install -e ".[all]"
```

If you want to run tests with `pytest`, install at least `.[tests]`.


##### When do I need to re-run this?

You only need to re-run the `pip install -e ...` commands if:
- You modify a pyproject.toml file (e.g. add/change dependencies, version, package metadata)
- You change package configuration such as package-data
- You recreate or delete your virtual environment

**You do not need to re-run them when editing:**
- Python source files (.py)
- Test files
- Ontology files (.ttl, .owl, etc.)

Editable mode automatically reflects those changes.

------------------------------------------------------------------------

### 4. Run Tests

``` bash
pytest
```

To get a coverage report:
``` bash
pytest --cov
```

<details>
<summary>Java requirement for ontology consistency tests</summary>

The Owlready2-based ontology consistency test in `tests/ontology_consistency_test/` requires Java to be installed locally. The test will fail if Java is not available.

**macOS (Homebrew):**
``` bash
brew install openjdk
sudo ln -sfn "$(brew --prefix openjdk)/libexec/openjdk.jdk" /Library/Java/JavaVirtualMachines/openjdk.jdk
export PATH="$(brew --prefix openjdk)/bin:$PATH"
java -version
```

**Linux (Debian/Ubuntu):**
``` bash
sudo apt-get update
sudo apt-get install -y default-jre
java -version
```

**Windows:**

Install a JRE or JDK such as Eclipse Temurin or Microsoft Build of OpenJDK, then open a new terminal and verify:

``` powershell
java -version
```

</details>

------------------------------------------------------------------------
### 5. Update and generate the documentation

The documentation uses [zensical](https://github.com/zensical/zensical) as template. Install the required packages:

``` bash
pip install ".[docs]"
```

Edit file in `./docs` folder to update the documentation. 
Run the following command to preview the documentation as changes are made:

``` python
zensical serve
```
Go to localhost:8000 to view the documentation.

Generate the full documentation:

``` python
zensical build
```


### 6. Run a Script Manually

After installing in editable mode, you can run scripts that import the
package:

``` python
from information_model.assets import as_path

with as_path("owl/core-ontology.ttl") as p:
    print(p.read_text())
```

Without installing the packages first, imports like `information_model`
will fail.

## References

This work is essentially derived and repackaged from the Standard Information Model created by the IEC SG12 SIM group.
We have considered existing ontologies ([SPEC](https://w3id.org/spec-ontology/spec/), [DOCO](https://sparontologies.github.io/doco/current/doco.html)) but not used them as they did not match the scope above.
