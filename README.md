# TIDAS Link

TIDAS Link is a standalone exchange profile for supply-chain environmental impact data. It is based on TIDAS evidence models, keeps product carbon footprint fields compatible with PACT-style exchange, and carries selected LCIA results as a compact extension.

The project is intentionally separate from the core TIDAS repository. TIDAS remains the upstream data model for process, flow, source, unit group, and LCIA method datasets. TIDAS Link defines the partner-facing payload, references TIDAS evidence by URI or identifier, and can evolve on its own release cycle.

## Contents

- `docs/profile-v0-1.md`: TIDAS Link v0.1 profile.
- `docs/field-mapping.md`: field mapping across TIDAS, PACT, DPP, traceability, credentials, and data-space concepts.
- `docs/relationship-to-tidas.md`: project boundary and dependency policy.
- `docs/source-audit.md`: local and public source audit.
- `schemas/`: JSON Schemas for the PCF profile and LCIA extension.
- `examples/`: illustrative payloads.

## Validation

```bash
npm run validate
```

The validation command checks that JSON files parse and validates the example payloads against the v0.1 schemas.
