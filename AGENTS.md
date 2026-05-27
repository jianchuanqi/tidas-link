# AGENTS.md - TIDAS Link

This is a standalone project under `/Users/jianchuan/Dev/tidas-link`.

## Project Identity

- Project name: TIDAS Link
- Role: supply-chain exchange profile for PCF and selected LCIA result interaction
- Upstream dependency: `/Users/jianchuan/Dev/tidas`
- PACT compatibility source: `/Users/jianchuan/Dev/data-exchange-protocol`

## Boundaries

- Keep TIDAS Link separate from core TIDAS.
- Do not write protocol-specific fields into `/Users/jianchuan/Dev/tidas` unless explicitly requested.
- Use TIDAS as the upstream evidence and schema model.
- Use PACT as a compatibility target, not as the public project name.

## Default Write Scope

- `docs/`
- `schemas/`
- `examples/`
- `scripts/`

## Validation

Run:

```bash
npm run validate
```
