---
sidebar_position: 4
---

# TIDAS Link Source Audit

This page records the field sources used for TIDAS Link v0.1. It is an implementation audit, not a replacement for the upstream standards.

## Local Inputs

| Source | Local evidence used | Fields or concepts extracted |
| --- | --- | --- |
| PACT Technical Specifications v3 | `/Users/jianchuan/Dev/data-exchange-protocol/spec/v3/openapi.yaml`, `/Users/jianchuan/Dev/data-exchange-protocol/spec/v3/data-model.md` | `ProductFootprint`, `CarbonFootprint`, `DataModelExtension`, `DataQualityIndicators`, `Verification`, REST/list/get/event compatibility |
| TIDAS schemas | `/Users/jianchuan/Dev/tidas/static/schemas/` | TIDAS process evidence, LCIA method evidence, flow/source/unit references |
| NKRD protocol survey | `outputs/供应链可持续性碳数据传输交互协议分析报告.md` | protocol classification, field-family comparison, implementation boundaries |
| NKRD local field extracts | `analysis/*`, `source_files/pact_pathfinder/*`, `source_files/dpp_battery_passport/*`, `source_files/catena_x/*`, `source_files/lca_epd_formats/*` | PACT/TfS/Catena-X/BatteryPass/openEPD/UNTP/EPCIS field summaries |

## Official Public Sources Checked

| Source | Public source | TIDAS Link use |
| --- | --- | --- |
| PACT Technical Specifications v3.0.3 | [WBCSD PACT](https://wbcsd.github.io/tr/data-exchange-protocol/latest/) | PCF core and PACT-compatible export baseline |
| Catena-X CX-0136 Use Case PCF | [Catena-X standard](https://catenax-ev.github.io/docs/standards/CX-0136-UseCasePCF) | digital twin, EDC, PCF API, BPN and automotive implementation context |
| TfS PCF Guideline/Data Model | [TfS PCF page](https://www.tfs-initiative.com/pcf-guideline) | chemical/material fields for allocation, mass balance, carbon content, certification share, PDS/DQR |
| iLEAP logistics emissions DME | [PACT resource page](https://www.carbon-transparency.org/resources/sfc-logistics-extension) | logistics emissions references for shipment, TCE, TOC, HOC, ISO 14083/GLEC alignment |
| Battery Pass Data Model v1.2.0 | [BatteryPassDataModel](https://batterypass.github.io/BatteryPassDataModel/) | battery context, carbon footprint lifecycle stages, study references, passport identifier |
| Regulation (EU) 2023/1542 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1542/oj) | battery carbon-footprint declaration context and battery passport interoperability requirements |
| openEPD | [openEPD format](https://docs.open-epd-forum.org/en/open-epd-format-1/) | EPD evidence references, LCIA impact categories, measurement/uncertainty concepts |
| UNTP Digital Traceability Events | [UNTP DTE](https://untp.unece.org/docs/specification/DigitalTraceabilityEvents/) | `MakeEvent`, `MoveEvent`, `ModifyEvent`, W3C VC envelope, related documents |
| GS1 EPCIS / CBV | [GS1 EPCIS 2.0.1](https://ref.gs1.org/standards/epcis/2.0.1/) | event references, `bizStep`, `disposition`, `readPoint`, `bizLocation`, transformation evidence |
| W3C VC Data Model 2.0 | [W3C VC](https://www.w3.org/TR/vc-data-model-2.0/) | issuer, subject, status, proof, credential wrapper references |
| Eclipse Dataspace Protocol | [DSP 2025-1](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/) | catalog, contract negotiation, transfer process references |
| Gaia-X Credential Format | [Gaia-X 24.07](https://docs.gaia-x.eu/technical-committee/identity-credential-access-management/24.07/credential_format/) | legal participant, service/data resource credential references |

## Field Inclusion Decisions

| Field family | Decision |
| --- | --- |
| PCF identity, product, company, declared unit, reference period, geography | Included in `TIDAS-Link-PCF-0.1` with PACT-compatible names |
| PCF totals and GHG splits | Included in `pcf` |
| Data quality and primary data share | Included; at least one of `primaryDataShare` or `dqi` is required |
| Verification and assurance | Included as `pcf.verification`, `credentialRefs[]`, and `evidenceRefs[]` |
| LCIA results | Included only as `TIDAS-Link-LCIA-0.1` selected result extension |
| Full LCI process exchange lists | Excluded from public payload; kept in restricted TIDAS process evidence |
| Battery passport fields | Included as minimal `tidas.batteryContext` and evidence references |
| DPP/traceability events | Included by reference through `traceabilityRefs[]` |
| VC/Gaia-X credentials | Included by reference through `credentialRefs[]` |
| EDC/DSP data-space transfer | Included by reference through `controlledTransfer` |

## Public Disclosure Boundary

The public TIDAS Link profile intentionally avoids embedding confidential source documents or unpublished strategy notes. Public docs only include derived field families and links to official public sources. Restricted evidence should be resolved through TIDAS permissions, credentials, or data-space transfer policies.
