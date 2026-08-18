# AGENTS.md - TIDAS Link

This is a standalone project under `/Users/jianchuan/Dev/tidas-link`.

## Project Identity

- Project name: TIDAS Link
- Role: a lightweight schema set for exchanging LCI and LCIA results,
  including the PCF profile and the upstream results or datasets actually
  used in a calculation
- Upstream dependency: `/Users/jianchuan/Dev/tidas`
- PACT Binding source: `/Users/jianchuan/Dev/data-exchange-protocol`

## Boundaries

- Keep TIDAS Link separate from TIDAS.
- Treat TIDAS as a read-only upstream dependency. Never modify TIDAS schemas,
  architecture, or repository files from this project.
- TIDAS owns full process, flow, source, unit-group, lifecycle-model, and LCIA
  method datasets.
- Organize TIDAS Link as a schema set with shared types, calculation inputs,
  a common LCA result, strict LCI and LCIA result schemas, and a PCF profile
  under LCIA.
- Store actual upstream use under the target result's `calculationInputs`.
  Do not create a separate target/source workflow document for the same fact.
- Keep ordinary information-system transfer fields outside TIDAS Link,
  including message routing, sender and recipient, authentication,
  authorization, pagination, delivery state, retry, error, storage, and audit.
- Distinguish a result field from a similarly named message field. For example,
  `resultId` is in scope while `messageId` is not; `resultStatus` is in scope
  while `deliveryStatus` is not.
- Keep PACT REST, CloudEvents, exact PACT field names, and version-specific
  conversion rules in the PACT Binding.
- Keep requests, delivery workflow, trace questions and answers, notifications,
  supply-chain decision methods, authorization, and platform execution outside
  TIDAS Link.
- Do not add a workflow record when the same project need can be met by an LCA
  result or its calculation inputs.
- Do not claim complete PACT API or Methodology conformance without separate
  evidence.

## Default Write Scope

- `docs/`
- `schemas/`
- `examples/`
- `scripts/`
- `bindings/`
- `test/`

## Validation

Run:

```bash
npm run validate
```
