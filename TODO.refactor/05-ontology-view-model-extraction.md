# 05 — OntologyViewModel resolver extraction

## Problem
`ontologyViewModel.ts` (443 lines) is well-structured internally (separate
resolve* functions) but the file is large. The resolve functions could be
extracted into focused classes.

## Evaluation
The functions are all called by one composition function. Splitting them
into separate files adds import indirection without clear benefit.
**Deletion test**: complexity doesn't scatter — it stays in the well-organized file.

Status: **evaluated — current structure is sufficient**.
