---
sidebar_position: 1
---

# TIDAS Link v0.1 Profile

TIDAS Link is a TIDAS profile for supply-chain environmental impact data interaction. It is designed for product-level PCF first, with a compact LCIA extension and evidence references. The name does not expose any upstream protocol name; the technical requirement is that TIDAS Link payloads can be exported to a PACT-compatible ProductFootprint when a counterparty needs PACT interoperability.

## Status

| Item | Decision |
| --- | --- |
| Profile name | TIDAS Link |
| Version | v0.1 draft |
| Repository location | Standalone `tidas-link` project under `/Users/jianchuan/Dev/tidas-link` |
| PCF schema | `schemas/tidas_link_pcf_v0_1.json` |
| LCIA extension schema | `schemas/tidas_link_lcia_extension_v0_1.json` |
| Primary compatibility target | PACT Technical Specifications v3.0.x |
| Main payload style | TIDAS-native payload with PACT-compatible PCF fields and TIDAS evidence, LCIA, traceability, credential, and controlled-transfer references |

## Scope

TIDAS Link v0.1 covers:

- product or product-variant PCF summary exchange;
- selected LCIA result disclosure without exposing full LCI exchanges;
- evidence references to TIDAS process datasets, LCIA method datasets, EPDs, studies, verification reports, and restricted documents;
- supply-chain traceability references through EPCIS, UNTP DTE, GS1 Digital Link, or equivalent identifiers;
- verification and credential references through PACT verification metadata, UNTP DCC, W3C VC, or Gaia-X style credentials;
- controlled transfer references for data-space implementations such as EDC/DSP.

TIDAS Link v0.1 does not cover:

- full unit-process LCI disclosure between companies;
- process-level exchange lists as a public payload;
- a replacement for TIDAS process, flow, source, unit group, or LCIA method datasets;
- a full Digital Product Passport implementation.

## Design Principles

1. Keep the product-facing payload small enough for supplier-to-customer exchange.
2. Use PACT field names for the PCF core so export to PACT is mechanical.
3. Use TIDAS references for evidence instead of embedding confidential process data.
4. Carry LCIA as a result extension, not as raw LCI.
5. Link traceability, credentials, and data-space contracts by reference.
6. Keep protocol compatibility separate from the public scheme name.

## Payload Modes

| Mode | Use | Rule |
| --- | --- | --- |
| Native TIDAS Link | TIDAS-to-TIDAS, trusted data spaces, battery or LCIA pilots | May include `schemaVersion`, `tidas`, `evidenceRefs`, `traceabilityRefs`, `credentialRefs`, and `controlledTransfer` |
| Strict PACT export | Counterparty requires PACT Technical Specifications compatibility | Export only PACT `ProductFootprint`, `CarbonFootprint`, and PACT `DataModelExtension` fields |

In strict PACT export, TIDAS-only root fields are removed or moved into PACT `extensions`. The exported object retains PACT-compatible identifiers, product fields, company fields, PCF fields, data quality, verification, and extension payloads.

## Core Object

The root TIDAS Link PCF object follows the PACT `ProductFootprint` structure and adds TIDAS metadata:

| Field group | Required in v0.1 | Purpose |
| --- | ---: | --- |
| `schemaVersion` | Yes | TIDAS Link profile version, fixed to `TIDAS-Link-PCF-0.1` |
| `id`, `created`, `status` | Yes | Footprint identity and lifecycle |
| `companyName`, `companyIds` | Yes | Data owner identity |
| `productNameCompany`, `productDescription`, `productIds` | Yes | Product identity and recognition by receiver |
| `productClassifications` | Recommended | HS, CN, GTIN, CPC, CAS, UNSPSC, or project-specific classification |
| `pcf` | Yes | PACT-compatible `CarbonFootprint` core |
| `tidas` | Yes | TIDAS profile metadata, granularity, confidentiality, compatibility mode |
| `evidenceRefs` | Yes | TIDAS process, source, EPD, study, verification, or restricted evidence pointers |
| `traceabilityRefs` | Recommended | EPCIS, UNTP DTE, GS1 Digital Link, batch, serial, shipment, or material-flow evidence |
| `credentialRefs` | Recommended | VC, UNTP DCC, Gaia-X credential, assurance, or conformity references |
| `controlledTransfer` | Optional | Data-space catalog, contract, transfer process, and audit references |
| `extensions` | Optional | PACT-compatible `DataModelExtension` objects; LCIA SHOULD be carried here when export compatibility matters |

## PCF Core

The `pcf` object keeps the PACT-compatible field names. TIDAS Link v0.1 requires a small subset and recommends additional battery, materials, and logistics fields.

| Field | Required | Notes |
| --- | ---: | --- |
| `declaredUnitOfMeasurement` | Yes | PACT declared unit, e.g. `piece`, `kilogram`, `kWh` |
| `declaredUnitAmount` | Yes | Amount of declared units |
| `productMassPerDeclaredUnit` | Yes | Product mass per declared unit, excluding packaging |
| `referencePeriodStart`, `referencePeriodEnd` | Yes | Time period of the PCF |
| `geographyCountry` or equivalent geography field | Recommended | PACT supports country, subdivision, region, and global granularity |
| `boundaryProcessesDescription` | Recommended | Short boundary and process coverage statement |
| `pcfExcludingBiogenicUptake` | Yes | Main product GHG value in kg CO2e per declared unit |
| `pcfIncludingBiogenicUptake` | Yes | PACT-compatible value including biogenic uptake |
| `fossilGhgEmissions` | Yes | Fossil GHG emissions |
| `fossilCarbonContent` | Yes | Fossil carbon content |
| `biogenicCarbonContent`, `recycledCarbonContent` | Recommended | Materials and circularity context |
| `packagingEmissionsIncluded`, `packagingGhgEmissions` | Recommended | Packaging coverage and value |
| `outboundLogisticsGhgEmissions` | Recommended | Logistics contribution; iLEAP-style detail stays in an extension or evidence reference |
| `ipccCharacterizationFactors` | Yes | Usually `AR6` for new work unless a method requires otherwise |
| `crossSectoralStandards` | Yes | Examples: `GHGP-Product`, `ISO14067`, `PACT-3.0` |
| `productOrSectorSpecificRules` | Recommended | TfS, Catena-X, battery, product-category, or project-specific rules |
| `exemptedEmissionsPercent` | Yes | Excluded emissions share |
| `secondaryEmissionFactorSources` | Recommended | Source names and versions |
| `primaryDataShare` or `dqi` | Yes | At least one is required in v0.1 |
| `verification` | Recommended | Third-party, second-party, first-party, or unverified metadata |

## LCIA Extension

TIDAS Link does not attempt to turn PACT into a full LCIA protocol. Instead, it adds a compact `TIDAS-Link-LCIA-0.1` extension for selected results.

Each `impactResults[]` item carries:

| Field | Required | Purpose |
| --- | ---: | --- |
| `impactCategory` | Yes | Climate change, acidification, eutrophication, water use, resource use, etc. |
| `indicator` | Yes | GWP total, AP, EP freshwater, WDP, PM, etc. |
| `method` | Yes | IPCC, EF, EN 15804, ReCiPe, TRACI, CML, USEtox, etc. |
| `methodVersion` | Recommended | Method version such as AR6 or EF 3.1 |
| `value` | Yes | Numeric impact result |
| `unit` | Yes | Indicator unit |
| `lifeCycleStage`, `module` | Recommended | Battery lifecycle stage or EPD module |
| `tidasMethodRef` | Recommended | Reference to a TIDAS LCIA method dataset |
| `tidasProcessRefs` | Recommended | References to restricted TIDAS process evidence |
| `evidenceRefs` | Recommended | Study, EPD, ILCD, openEPD, or verification evidence |
| `dataQuality`, `uncertainty` | Recommended | DQR/PDS and uncertainty metadata |

## Evidence And Privacy

TIDAS Link v0.1 uses evidence references instead of raw disclosure by default.

| Evidence type | Use |
| --- | --- |
| `tidas-process` | Restricted process or product system evidence in TIDAS |
| `tidas-lcia-method` | LCIA method or characterization factor evidence |
| `tidas-source` | Source dataset, study, publication, or document reference |
| `openepd`, `ilcd`, `ecospold2`, `epd` | External LCA or EPD evidence |
| `verification-report` | Assurance report, conformity assessment, or audit record |
| `untp-dcc`, `gaia-x-credential` | Credentialed conformity or data-space trust statement |
| `edc-asset`, `dsp-contract` | Data-space asset and contract references |

Sensitive process data, full exchange lists, formulas, supplier BOMs, and cost-revealing inputs SHOULD remain in restricted TIDAS datasets or data-space assets. The public or partner-facing TIDAS Link payload SHOULD disclose only the summary results and the minimum evidence needed to verify the claim.

## Versioning

TIDAS Link versions use profile identifiers:

- `TIDAS-Link-PCF-0.1` for the PCF root payload;
- `TIDAS-Link-LCIA-0.1` for selected LCIA results;
- future modules MAY use `TIDAS-Link-DPP-*`, `TIDAS-Link-Trace-*`, or `TIDAS-Link-Transfer-*`.

Breaking changes require a new minor or major version. Additive optional fields may keep the same profile version when they are namespaced under `extensions`.

## Source Basis

TIDAS Link v0.1 is based on these source families:

- TIDAS process, LCIA method, flow, source, and unit group schemas from the upstream TIDAS project.
- [PACT Technical Specifications v3.0.3](https://wbcsd.github.io/tr/data-exchange-protocol/latest/) and the local PACT repository supplied for this work.
- [Catena-X CX-0136 Use Case PCF](https://catenax-ev.github.io/docs/standards/CX-0136-UseCasePCF) for digital twin, EDC, and automotive PCF exchange context.
- [TfS PCF Guideline and Data Model](https://www.tfs-initiative.com/pcf-guideline) for chemical/material supplier data-quality and allocation fields.
- [iLEAP logistics emissions DME](https://www.carbon-transparency.org/resources/sfc-logistics-extension) for shipment, TCE, TOC, and HOC logistics emissions.
- [Battery Pass Data Model v1.2.0](https://batterypass.github.io/BatteryPassDataModel/) and [Regulation (EU) 2023/1542](https://eur-lex.europa.eu/eli/reg/2023/1542/oj) for battery passport carbon-footprint context.
- [openEPD format](https://docs.open-epd-forum.org/en/open-epd-format-1/) for EPD and LCIA result interchange ideas.
- [UNTP Digital Traceability Events](https://untp.unece.org/docs/specification/DigitalTraceabilityEvents/) and [GS1 EPCIS](https://ref.gs1.org/standards/epcis/2.0.1/) for supply-chain traceability references.
- [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/), [Eclipse Dataspace Protocol](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/), and [Gaia-X Credential Format](https://docs.gaia-x.eu/technical-committee/identity-credential-access-management/24.07/credential_format/) for credential and controlled-transfer references.
