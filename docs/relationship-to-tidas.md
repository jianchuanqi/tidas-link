# Relationship To TIDAS

TIDAS Link should be treated as a downstream companion project, not as a module inside the core TIDAS repository.

## Boundary

| Project | Role | Owns |
| --- | --- | --- |
| TIDAS | Core LCA data model and dataset schemas | Process datasets, LCIA method datasets, flows, sources, unit groups, lifecycle models |
| TIDAS Link | Supply-chain exchange profile | Partner-facing PCF payload, selected LCIA result extension, evidence references, traceability references, credential references, data-space transfer references |

The split keeps TIDAS stable as the evidence and modeling layer. TIDAS Link can move faster as an interoperability and pilot implementation layer without forcing protocol-specific fields into the core model.

## Dependency Policy

TIDAS Link depends on TIDAS by versioned reference:

- every TIDAS Link release declares the compatible TIDAS schema release, tag, or commit;
- TIDAS evidence is referenced by URI, UUID, dataset identifier, or resolver target;
- TIDAS process exchange lists are not copied into public TIDAS Link payloads;
- compatibility tests should validate that TIDAS evidence references keep their expected shape when the upstream TIDAS schema changes.

The initial v0.1 baseline uses the local upstream TIDAS schemas at `/Users/jianchuan/Dev/tidas/static/schemas/`.

## Repository Relationship

Recommended setup:

1. Keep `/Users/jianchuan/Dev/tidas-link` as its own Git repository.
2. Do not use a Git submodule by default. Pin the upstream TIDAS version in release notes or a future machine-readable compatibility file.
3. In CI, clone or fetch TIDAS only for compatibility tests that need upstream schema fixtures.
4. Add only a short external link from the TIDAS website to TIDAS Link after the profile stabilizes.
5. Do not make TIDAS releases depend on TIDAS Link releases.

## Version Matrix

| TIDAS Link version | TIDAS dependency | PACT compatibility | Notes |
| --- | --- | --- | --- |
| v0.1 draft | Local TIDAS schema baseline, May 2026 | PACT Technical Specifications v3.0.x | PCF core plus selected LCIA extension |

## Integration Contract

TIDAS Link payloads reference TIDAS rather than embedding TIDAS internals:

- `tidasProcessRefs[]` points to restricted TIDAS process or product-system evidence;
- `tidasMethodRef` points to the LCIA method or characterization-factor evidence;
- `evidenceRefs[]` can point to TIDAS source datasets, EPDs, studies, verification reports, or controlled documents;
- `controlledTransfer` can point to data-space contracts and transfer processes that authorize access to restricted evidence.

This makes TIDAS Link suitable for supply-chain exchange while preserving the privacy and modeling depth of TIDAS.
