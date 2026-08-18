# TIDAS-Link Schema Set

- `common.json`: shared LCA types
- `calculation-input.json`: upstream result or background dataset used in a calculation
- `lca-result.json`: common LCA result
- `lci-result.json`: LCI result
- `lcia-result.json`: LCIA result
- `pcf-profile.json`: product carbon-footprint profile of an LCIA result

The result hierarchy is LCA Result -> LCI Result or LCIA Result -> PCF
Profile. Use the type-specific schema, and use `pcf-profile.json` for a
product carbon footprint.

Result values are separated into `inventoryResults`, `impactResults`, and
`reportedParameters`. Actual upstream calculation sources are recorded in
`calculationInputs`.
