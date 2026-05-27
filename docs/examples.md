---
sidebar_position: 3
---

# TIDAS Link Examples

This page provides the first v0.1 example payloads. The values are illustrative and are not product claims.

## Published Files

| Artifact | Path |
| --- | --- |
| PCF schema | [`schemas/tidas_link_pcf_v0_1.json`](../schemas/tidas_link_pcf_v0_1.json) |
| LCIA extension schema | [`schemas/tidas_link_lcia_extension_v0_1.json`](../schemas/tidas_link_lcia_extension_v0_1.json) |
| Battery cell PCF example | [`examples/battery-cell-pcf-v0-1.json`](../examples/battery-cell-pcf-v0-1.json) |
| Battery cell LCIA extension example | [`examples/battery-cell-lcia-extension-v0-1.json`](../examples/battery-cell-lcia-extension-v0-1.json) |

## Example Shape

The PCF example uses this high-level shape:

```json
{
  "schemaVersion": "TIDAS-Link-PCF-0.1",
  "specVersion": "3.0.3",
  "companyName": "Example Battery Cell Supplier Ltd.",
  "productNameCompany": "Example NMC Battery Cell",
  "pcf": {
    "declaredUnitOfMeasurement": "piece",
    "pcfExcludingBiogenicUptake": "74.20",
    "ipccCharacterizationFactors": ["AR6"],
    "crossSectoralStandards": ["GHGP-Product", "ISO14067", "PACT-3.0"],
    "primaryDataShare": "68.5"
  },
  "tidas": {
    "profile": "TIDAS Link",
    "profileVersion": "0.1",
    "pactCompatibility": {
      "version": "3.0.3",
      "mode": "native-with-extensions"
    }
  },
  "evidenceRefs": [],
  "extensions": []
}
```

The LCIA example is carried in a PACT-compatible `extensions[]` object and can also be validated independently:

```json
{
  "schemaVersion": "TIDAS-Link-LCIA-0.1",
  "impactResults": [
    {
      "impactCategory": "climate change",
      "indicator": "GWP total",
      "method": "IPCC",
      "methodVersion": "AR6",
      "value": "74.20",
      "unit": "kg CO2e"
    }
  ]
}
```

## Validation

At minimum, validation should check:

1. The JSON files parse.
2. The PCF example satisfies `tidas_link_pcf_v0_1.json`.
3. The LCIA example satisfies `tidas_link_lcia_extension_v0_1.json`.
4. A strict PACT export can remove TIDAS-only root fields while preserving `ProductFootprint`, `CarbonFootprint`, and `DataModelExtension` content.

The project validation scripts parse the JSON files and validate the example payloads against the schemas.

## Strict PACT Export Notes

For strict PACT export, remove:

- `schemaVersion`
- `tidas`
- `evidenceRefs`
- `traceabilityRefs`
- `credentialRefs`
- `controlledTransfer`

Keep:

- `id`
- `specVersion`
- `created`
- `status`
- `companyName`
- `companyIds`
- `productDescription`
- `productIds`
- `productNameCompany`
- `productClassifications`
- `pcf`
- `extensions`

The LCIA extension remains available as a PACT `DataModelExtension`, but a PACT-only receiver is only expected to store or forward it unless it explicitly implements the TIDAS Link LCIA schema.
