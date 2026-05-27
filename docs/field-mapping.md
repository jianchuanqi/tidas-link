---
sidebar_position: 2
---

# TIDAS Link Field Mapping

This page explains how TIDAS Link v0.1 maps to PACT, TIDAS, battery passport, traceability, credential, and data-space sources. The mapping is intentionally conservative: only product-level summary results and references are moved through the TIDAS Link payload; full TIDAS process exchange lists stay in restricted evidence datasets.

## Identity And Product Context

| TIDAS Link field | PACT | TIDAS | Battery/DPP | Traceability |
| --- | --- | --- | --- | --- |
| `id` | `ProductFootprint.id` | Dataset URI or package record ID | Passport record ID if relevant | Credential or resolver target ID |
| `companyName` | `ProductFootprint.companyName` | Contact or source organization | Manufacturer/operator information | UNTP Party, Gaia-X LegalPerson |
| `companyIds[]` | `ProductFootprint.companyIds` | Contact/source identifiers | Manufacturer ID, operator ID | LEI, DID, BPN, GLN, registered ID |
| `productNameCompany` | `ProductFootprint.productNameCompany` | Process or flow name | Product model/name | DPP product name |
| `productDescription` | `ProductFootprint.productDescription` | Process technology description | Battery/product description | DPP description |
| `productIds[]` | `ProductFootprint.productIds` | Flow UUID, process reference, product system ID | Battery passport identifier, GTIN, serial, batch | GS1 Digital Link, EPC, UNTP Product ID |
| `productClassifications[]` | `ProductFootprint.productClassifications` | Classification information | Battery category, CN/HS code | Product category |

## Declared Unit, Time, And Geography

| TIDAS Link field | PACT | TIDAS / LCA evidence | Battery / EPD context |
| --- | --- | --- | --- |
| `pcf.declaredUnitOfMeasurement` | Required PACT field | Quantitative reference unit | Battery regulation may also require kg CO2e/kWh over expected service life |
| `pcf.declaredUnitAmount` | Required PACT field | Quantitative reference amount | Declared unit or functional unit |
| `pcf.productMassPerDeclaredUnit` | Required PACT field | Flow property and mass evidence | Battery mass or product mass |
| `pcf.referencePeriodStart/End` | Required PACT field | Time representativeness | EPD validity and issue dates are evidence, not substitutes |
| `pcf.geographyCountry`, `geographyCountrySubdivision`, `geographyRegionOrSubregion` | PACT geography scope | Geography representativeness | Manufacturing place / plant location |

## PCF Results And Method Metadata

| TIDAS Link field | PACT / Catena-X / TfS | TIDAS / openEPD / ILCD | Notes |
| --- | --- | --- | --- |
| `pcf.pcfExcludingBiogenicUptake` | Main PCF value | GWP result evidence | Required in v0.1 |
| `pcf.pcfIncludingBiogenicUptake` | PCF including biogenic uptake | GWP result evidence | Required in v0.1 |
| `pcf.fossilGhgEmissions` | Fossil GHG split | LCIA/GWP split evidence | Required in v0.1 |
| `pcf.fossilCarbonContent` | Carbon content field | Flow/material evidence | Required in v0.1 |
| `pcf.biogenicCarbonContent` | Optional PACT/TfS field | Flow/material evidence | Recommended |
| `pcf.recycledCarbonContent` | TfS/Catena-X style circular carbon field | Material evidence | Recommended for battery/material cases |
| `pcf.packagingEmissionsIncluded` | PACT/TfS packaging flag | Process boundary evidence | Recommended |
| `pcf.packagingGhgEmissions` | PACT packaging contribution | Stage result evidence | Recommended when known |
| `pcf.outboundLogisticsGhgEmissions` | PACT outbound logistics extension field | Logistics evidence | iLEAP details stay in extension/evidence |
| `pcf.ipccCharacterizationFactors` | PACT GWP factor source | LCIA method reference | Use AR6 unless another rule applies |
| `pcf.crossSectoralStandards` | PACT allowed standards | Source references | Examples: `GHGP-Product`, `ISO14067`, `PACT-3.0` |
| `pcf.productOrSectorSpecificRules` | PACT/TfS/Catena-X rule metadata | Source references | Use for battery, chemical, product category rules |
| `pcf.exemptedEmissionsPercent` | PACT/TfS field | Boundary evidence | Required in v0.1 |
| `pcf.secondaryEmissionFactorSources[]` | PACT/TfS field | TIDAS source refs | Recommended |
| `pcf.primaryDataShare` | PACT/TfS/Catena-X field | Data quality evidence | Required unless `dqi` is present |
| `pcf.dqi` | PACT DQR fields | Data quality evidence | Required unless `primaryDataShare` is present |
| `pcf.verification` | PACT verification | Verification report or credential | Recommended |

## LCIA Extension Mapping

| TIDAS Link LCIA field | TIDAS | openEPD / ILCD | PACT export behavior |
| --- | --- | --- | --- |
| `impactCategory` | LCIA method category | `ImpactSet` categories or ILCD LCIA result category | Export through DataModelExtension only |
| `indicator` | LCIA method indicator | `gwp`, `ap`, `ep`, `WDP`, `PM`, etc. | Export through DataModelExtension only |
| `method`, `methodVersion` | LCIA method dataset | EF, IPCC, EN 15804, ReCiPe, TRACI, CML, USEtox | Export through DataModelExtension only |
| `value`, `unit` | LCIA result value | Measurement object or ILCD LCIA result | Export through DataModelExtension only |
| `lifeCycleStage`, `module` | Process/model module or stage | EPD modules A1-A3, A4, C, D | Export through DataModelExtension only |
| `tidasMethodRef` | LCIA method dataset reference | LCIA method source | TIDAS evidence reference |
| `tidasProcessRefs[]` | Process evidence datasets | ILCD/openEPD source refs | TIDAS evidence reference |
| `evidenceRefs[]` | Source/study/verification refs | EPD/study refs | TIDAS evidence reference |
| `dataQuality`, `uncertainty` | Data quality and uncertainty metadata | openEPD measurement uncertainty, ILCD validation | Export through DataModelExtension only |

## Battery And DPP Mapping

| Battery / DPP field family | TIDAS Link target |
| --- | --- |
| Battery passport identifier | `tidas.batteryContext.batteryPassportIdentifier`, `productIds[]`, `evidenceRefs[]` |
| Battery category, chemistry, mass, place | `tidas.batteryContext`, `productClassifications[]`, `pcf.productMassPerDeclaredUnit` |
| Battery carbon footprint total | `pcf.pcfExcludingBiogenicUptake`, plus battery-regulation unit note if needed |
| Carbon footprint lifecycle stages | `extensions[].data.impactResults[].lifeCycleStage` or evidence references |
| Carbon footprint study | `evidenceRefs[]` with `study`, `epd`, `ilcd`, or `openepd` type |
| Performance class or declaration of conformity | `credentialRefs[]` or `evidenceRefs[]` |
| Material composition and due diligence | `evidenceRefs[]`; only disclose summary fields when required |

## Traceability And Trust Mapping

| Source family | TIDAS Link target | Use |
| --- | --- | --- |
| GS1 Digital Link | `traceabilityRefs[]` with `gs1-digital-link` | Resolve product/batch/serial to PCF, DPP, EPD, or credential |
| EPCIS / CBV | `traceabilityRefs[]` with `epcis-event` | Object, aggregation, transformation, transaction, and association events |
| UNTP DTE | `traceabilityRefs[]` with `untp-dte` | Make, move, and modify lifecycle credentials |
| UNTP DCC | `credentialRefs[]` with `untp-dcc` | Conformity and assurance credentials |
| W3C VC / DID | `credentialRefs[]` | Issuer, subject, status, proof, and verifiable presentation references |
| Gaia-X | `credentialRefs[]` with `gaia-x-credential` | Legal participant, service, data resource, and compliance credentials |
| EDC / DSP | `controlledTransfer` | Catalog, contract negotiation, transfer process, and audit policy |

## Compatibility Rules

TIDAS Link v0.1 uses these export rules for PACT compatibility:

1. Keep PACT-compatible field names in `ProductFootprint` and `CarbonFootprint`.
2. Keep TIDAS Link LCIA as a PACT `DataModelExtension` when sending to a PACT-oriented counterparty.
3. Remove TIDAS-only root fields for strict PACT export: `schemaVersion`, `tidas`, `evidenceRefs`, `traceabilityRefs`, `credentialRefs`, and `controlledTransfer`.
4. Do not disclose full TIDAS process `exchanges` in the TIDAS Link payload.
5. Carry restricted evidence by reference and resolve it only through the configured permission or data-space mechanism.

## Source Notes

The mapping was derived from the local PACT v3 OpenAPI and data model repository supplied for this work, current TIDAS schemas in this repository, and official public sources for [PACT](https://wbcsd.github.io/tr/data-exchange-protocol/latest/), [Catena-X PCF](https://catenax-ev.github.io/docs/standards/CX-0136-UseCasePCF), [TfS PCF](https://www.tfs-initiative.com/pcf-guideline), [iLEAP](https://www.carbon-transparency.org/resources/sfc-logistics-extension), [Battery Pass](https://batterypass.github.io/BatteryPassDataModel/), [openEPD](https://docs.open-epd-forum.org/en/open-epd-format-1/), [UNTP DTE](https://untp.unece.org/docs/specification/DigitalTraceabilityEvents/), [GS1 EPCIS](https://ref.gs1.org/standards/epcis/2.0.1/), [W3C VC](https://www.w3.org/TR/vc-data-model-2.0/), [Eclipse DSP](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/), and [Gaia-X Credential Format](https://docs.gaia-x.eu/technical-committee/identity-credential-access-management/24.07/credential_format/).
