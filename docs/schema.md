# Schema Files

TIDAS Link v0.1 publishes two JSON Schemas:

| Schema | Purpose |
| --- | --- |
| [`schemas/tidas_link_pcf_v0_1.json`](../schemas/tidas_link_pcf_v0_1.json) | Product-level PCF payload with TIDAS evidence, traceability, credential, controlled-transfer, and extension references |
| [`schemas/tidas_link_lcia_extension_v0_1.json`](../schemas/tidas_link_lcia_extension_v0_1.json) | Compact selected LCIA result extension |

The LCIA extension can be carried as a PACT-compatible `DataModelExtension` inside a TIDAS Link PCF payload, or validated independently when only impact results are exchanged.
