#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  createPactProductFootprintValidator,
  formatValidationErrors,
  readJson,
  validationResult,
} = require("../../scripts/lib/validators");
const {
  schemaContext: linkSchemaContext,
  validatePayload: validateLinkPayload,
} = require("../../scripts/validate");

const DETAILS_EXTENSION_NAME = "PACT carbon-footprint details";

const resultFieldMappings = [
  {
    pactField: "pcfExcludingBiogenicUptake",
    resultItemId: "gwp-excluding-biogenic-uptake",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "GWP excluding biogenic uptake",
    unit: "kg CO2e",
  },
  {
    pactField: "pcfIncludingBiogenicUptake",
    resultItemId: "gwp-including-biogenic-uptake",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "GWP including biogenic uptake",
    unit: "kg CO2e",
  },
  {
    pactField: "fossilCarbonContent",
    resultItemId: "pact-fossil-carbon-content",
    target: "reportedParameters",
    indicator: "fossil carbon content",
    unit: "kg C",
  },
  {
    pactField: "biogenicCarbonContent",
    resultItemId: "pact-biogenic-carbon-content",
    target: "reportedParameters",
    indicator: "biogenic carbon content",
    unit: "kg C",
  },
  {
    pactField: "recycledCarbonContent",
    resultItemId: "pact-recycled-carbon-content",
    target: "reportedParameters",
    indicator: "recycled carbon content",
    unit: "kg C",
  },
  {
    pactField: "fossilGhgEmissions",
    resultItemId: "pact-fossil-ghg-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "fossil GHG emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "landUseChangeGhgEmissions",
    resultItemId: "pact-land-use-change-ghg-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "land-use-change GHG emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "landCarbonLeakage",
    resultItemId: "pact-land-carbon-leakage",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "land carbon leakage",
    unit: "kg CO2e",
  },
  {
    pactField: "landManagementFossilGhgEmissions",
    resultItemId: "pact-land-management-fossil-ghg-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "land-management fossil GHG emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "landManagementBiogenicCO2Emissions",
    resultItemId: "pact-land-management-biogenic-co2-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "land-management biogenic CO2 emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "landManagementBiogenicCO2Removals",
    resultItemId: "pact-land-management-biogenic-co2-removals",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "land-management biogenic CO2 removals",
    unit: "kg CO2e",
  },
  {
    pactField: "biogenicCO2Uptake",
    resultItemId: "pact-biogenic-co2-uptake",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "biogenic CO2 uptake",
    unit: "kg CO2e",
  },
  {
    pactField: "biogenicNonCO2Emissions",
    resultItemId: "pact-biogenic-non-co2-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "biogenic non-CO2 emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "landAreaOccupation",
    resultItemId: "pact-land-area-occupation",
    target: "reportedParameters",
    indicator: "land area occupation",
    unit: "m2/year",
  },
  {
    pactField: "aircraftGhgEmissions",
    resultItemId: "pact-aircraft-ghg-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "aircraft GHG emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "packagingGhgEmissions",
    resultItemId: "pact-packaging-ghg-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "packaging GHG emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "packagingBiogenicCarbonContent",
    resultItemId: "pact-packaging-biogenic-carbon-content",
    target: "reportedParameters",
    indicator: "packaging biogenic carbon content",
    unit: "kg C",
  },
  {
    pactField: "outboundLogisticsGhgEmissions",
    resultItemId: "pact-outbound-logistics-ghg-emissions",
    target: "impactResults",
    impactCategory: "climate change",
    indicator: "outbound logistics GHG emissions",
    unit: "kg CO2e",
  },
  {
    pactField: "ccsTechnologicalCO2Capture",
    resultItemId: "pact-ccs-technological-co2-capture",
    target: "reportedParameters",
    indicator: "CCS technological CO2 capture",
    unit: "kg CO2",
  },
  {
    pactField: "technologicalCO2Removals",
    resultItemId: "pact-technological-co2-removals",
    target: "reportedParameters",
    indicator: "technological CO2 removals",
    unit: "kg CO2",
  },
  {
    pactField: "ccuCarbonContent",
    resultItemId: "pact-ccu-carbon-content",
    target: "reportedParameters",
    indicator: "CCU carbon content",
    unit: "kg C",
  },
];

const detailFields = [
  "packagingEmissionsIncluded",
  "ccsTechnologicalCO2CaptureIncluded",
  "technologicalCO2CaptureOrigin",
  "ccuCalculationApproach",
  "ccuCreditCertification",
];

function compactObject(value) {
  if (Array.isArray(value)) {
    return value.map(compactObject);
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) {
      output[key] = compactObject(item);
    }
  }
  return output;
}

function asLinkId(value) {
  return value.startsWith("urn:") ? value : `urn:uuid:${value}`;
}

function asPactId(value) {
  return value.startsWith("urn:uuid:")
    ? value.slice("urn:uuid:".length)
    : value;
}

function pactStatusToLink(status) {
  return status === "Active" ? "active" : "superseded";
}

function linkStatusToPact(status) {
  return status === "active" || status === "draft"
    ? "Active"
    : "Deprecated";
}

function impactMethod(pcf) {
  return {
    name: "IPCC",
    version: pcf.ipccCharacterizationFactors.join(", "),
  };
}

function pactResults(pcf) {
  const output = {
    impactResults: [],
    reportedParameters: [],
  };
  for (const mapping of resultFieldMappings) {
    if (pcf[mapping.pactField] === undefined) {
      continue;
    }
    const item = {
      resultItemId: mapping.resultItemId,
      value: pcf[mapping.pactField],
      unit: mapping.unit,
      indicator: mapping.indicator,
    };
    if (mapping.target === "impactResults") {
      item.impactCategory = mapping.impactCategory;
      item.method = impactMethod(pcf);
    }
    output[mapping.target].push(item);
  }
  return {
    impactResults:
      output.impactResults.length > 0
        ? output.impactResults
        : undefined,
    reportedParameters:
      output.reportedParameters.length > 0
        ? output.reportedParameters
        : undefined,
  };
}

function pactDetailsExtension(payload) {
  const details = {};
  for (const field of detailFields) {
    if (payload.pcf[field] !== undefined) {
      details[field] = payload.pcf[field];
    }
  }
  if (
    payload.pcf.otherOperatorName !== undefined &&
    !payload.pcf.productOrSectorSpecificRules?.some(
      (rule) => rule.otherOperatorName,
    )
  ) {
    details.otherOperatorName = payload.pcf.otherOperatorName;
  }
  if (Object.keys(details).length === 0) {
    return undefined;
  }
  return {
    name: DETAILS_EXTENSION_NAME,
    version: payload.specVersion,
    data: details,
  };
}

function productRules(pcf) {
  const rules = structuredClone(
    pcf.productOrSectorSpecificRules || [],
  );
  if (pcf.otherOperatorName !== undefined) {
    const other = rules.find((rule) => rule.operator === "Other");
    if (other && other.otherOperatorName === undefined) {
      other.otherOperatorName = pcf.otherOperatorName;
    }
  }
  return rules;
}

function geography(pcf) {
  const value = compactObject({
    regionOrSubregion: pcf.geographyRegionOrSubregion,
    country: pcf.geographyCountry,
    countrySubdivision: pcf.geographyCountrySubdivision,
  });
  return Object.keys(value).length > 0 ? value : undefined;
}

function verificationFromPact(value) {
  if (value === undefined) {
    return undefined;
  }
  return {
    status: "third-party",
    ...structuredClone(value),
  };
}

function fromPact(payload, context = {}) {
  const pactValidate =
    context.pactValidate || createPactProductFootprintValidator();
  const pactValidation = validationResult(pactValidate, payload);
  if (!pactValidation.valid) {
    throw new Error(formatValidationErrors(pactValidation.errors));
  }

  const pcf = payload.pcf;
  const extension = pactDetailsExtension(payload);
  const result = compactObject({
    resultType: "lcia",
    profile: "pcf",
    resultId: asLinkId(payload.id),
    resultVersion: payload.created,
    precedingResultIds: payload.precedingPfIds?.map(asLinkId),
    resultStatus: pactStatusToLink(payload.status),
    dataOwner: {
      ids: payload.companyIds,
      name: payload.companyName,
    },
    subject: {
      type: "product",
      ids: payload.productIds,
      name: payload.productNameCompany,
      description: payload.productDescription,
      classifications: payload.productClassifications,
      granularity: "product-variant",
    },
    referenceQuantity: {
      basis: "declared-unit",
      amount: pcf.declaredUnitAmount,
      unit: pcf.declaredUnitOfMeasurement,
      massKg: pcf.productMassPerDeclaredUnit,
    },
    systemBoundary: {
      type: "cradle-to-gate",
      description:
        pcf.boundaryProcessesDescription ||
        "PACT cradle-to-gate product carbon-footprint boundary.",
    },
    referencePeriod: {
      start: pcf.referencePeriodStart,
      end: pcf.referencePeriodEnd,
    },
    validityPeriod:
      payload.validityPeriodStart && payload.validityPeriodEnd
        ? {
            start: payload.validityPeriodStart,
            end: payload.validityPeriodEnd,
          }
        : undefined,
    geography: geography(pcf),
    modeling: {
      standards: pcf.crossSectoralStandards,
      productOrSectorRules: productRules(pcf),
      allocationRulesDescription: pcf.allocationRulesDescription,
      cutOffRulesDescription: pcf.exemptedEmissionsDescription,
      excludedSharePercent: pcf.exemptedEmissionsPercent,
      secondaryDataSources: pcf.secondaryEmissionFactorSources,
    },
    ...pactResults(pcf),
    dataQuality: {
      primaryDataShare: pcf.primaryDataShare,
      technologicalDQR: pcf.dqi?.technologicalDQR,
      geographicalDQR: pcf.dqi?.geographicalDQR,
      temporalDQR: pcf.dqi?.temporalDQR,
    },
    verification: verificationFromPact(pcf.verification),
    limitations: payload.comment,
    lcaExtensions: extension ? [extension] : undefined,
  });

  const linkContext = context.linkContext || linkSchemaContext();
  const linkValidation = validateLinkPayload(result, linkContext);
  if (!linkValidation.valid) {
    throw new Error(
      formatValidationErrors([
        ...linkValidation.schema.errors,
        ...linkValidation.semantic.errors,
      ]),
    );
  }

  return {
    result,
    bindingMetadata: compactObject({
      protocol: "PACT",
      specVersion: payload.specVersion,
      created: payload.created,
      extensions: payload.extensions,
    }),
  };
}

function resultValue(result, mapping) {
  return (result[mapping.target] || []).find(
    (item) =>
      item.resultItemId === mapping.resultItemId ||
      item.indicator === mapping.indicator,
  )?.value;
}

function detailsFromResult(result) {
  return (
    result.lcaExtensions?.find(
      (extension) => extension.name === DETAILS_EXTENSION_NAME,
    )?.data || {}
  );
}

function pactProductRules(result, details) {
  const rules = structuredClone(
    result.modeling?.productOrSectorRules || [],
  );
  if (details.otherOperatorName !== undefined) {
    const other = rules.find((rule) => rule.operator === "Other");
    if (other && other.otherOperatorName === undefined) {
      other.otherOperatorName = details.otherOperatorName;
    }
  }
  return rules;
}

function pactVerification(value) {
  if (value === undefined) {
    return undefined;
  }
  const output = structuredClone(value);
  delete output.status;
  if (output.coverage === "product footprint") {
    output.coverage = "product level";
  }
  return output;
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0 ? value : undefined;
}

function toPact(result, bindingMetadata, context = {}) {
  const linkContext = context.linkContext || linkSchemaContext();
  const linkValidation = validateLinkPayload(result, linkContext);
  if (!linkValidation.valid) {
    throw new Error(
      formatValidationErrors([
        ...linkValidation.schema.errors,
        ...linkValidation.semantic.errors,
      ]),
    );
  }
  if (result.resultType !== "lcia" || result.profile !== "pcf") {
    throw new Error("PACT export requires a TIDAS Link PCF profile");
  }
  if (!bindingMetadata?.specVersion || !bindingMetadata?.created) {
    throw new Error(
      "PACT export requires bindingMetadata.specVersion and bindingMetadata.created",
    );
  }

  const details = detailsFromResult(result);
  const methodVersions = [
    ...new Set(
      result.impactResults
        .filter(
          (item) =>
            item.impactCategory === "climate change" &&
            item.method?.name === "IPCC",
        )
        .flatMap((item) =>
          item.method.version.split(",").map((value) => value.trim()),
        ),
    ),
  ];
  const pcf = compactObject({
    declaredUnitOfMeasurement: result.referenceQuantity.unit,
    declaredUnitAmount: result.referenceQuantity.amount,
    productMassPerDeclaredUnit: result.referenceQuantity.massKg,
    referencePeriodStart: result.referencePeriod.start,
    referencePeriodEnd: result.referencePeriod.end,
    geographyRegionOrSubregion: result.geography?.regionOrSubregion,
    geographyCountry: result.geography?.country,
    geographyCountrySubdivision: result.geography?.countrySubdivision,
    boundaryProcessesDescription: result.systemBoundary.description,
    ...Object.fromEntries(
      resultFieldMappings
        .map((mapping) => [
          mapping.pactField,
          resultValue(result, mapping),
        ])
        .filter(([, value]) => value !== undefined),
    ),
    ...Object.fromEntries(
      detailFields
        .map((field) => [field, details[field]])
        .filter(([, value]) => value !== undefined),
    ),
    ipccCharacterizationFactors: methodVersions,
    crossSectoralStandards: result.modeling?.standards,
    productOrSectorSpecificRules: nonEmptyArray(
      pactProductRules(result, details),
    ),
    exemptedEmissionsPercent:
      result.modeling?.excludedSharePercent,
    exemptedEmissionsDescription:
      result.modeling?.cutOffRulesDescription,
    allocationRulesDescription:
      result.modeling?.allocationRulesDescription,
    secondaryEmissionFactorSources: nonEmptyArray(
      result.modeling?.secondaryDataSources?.map(
        ({ name, version }) => ({
          name,
          version,
        }),
      ),
    ),
    primaryDataShare: result.dataQuality?.primaryDataShare,
    dqi:
      result.dataQuality?.technologicalDQR !== undefined &&
      result.dataQuality?.geographicalDQR !== undefined &&
      result.dataQuality?.temporalDQR !== undefined
        ? {
            technologicalDQR:
              result.dataQuality.technologicalDQR,
            geographicalDQR:
              result.dataQuality.geographicalDQR,
            temporalDQR: result.dataQuality.temporalDQR,
          }
        : undefined,
    verification: pactVerification(result.verification),
  });

  const payload = compactObject({
    id: asPactId(result.resultId),
    specVersion: bindingMetadata.specVersion,
    precedingPfIds: result.precedingResultIds?.map(asPactId),
    created: bindingMetadata.created,
    status: linkStatusToPact(result.resultStatus),
    validityPeriodStart: result.validityPeriod?.start,
    validityPeriodEnd: result.validityPeriod?.end,
    companyName: result.dataOwner.name,
    companyIds: result.dataOwner.ids,
    productDescription: result.subject.description,
    productIds: result.subject.ids,
    productClassifications: result.subject.classifications,
    productNameCompany: result.subject.name,
    comment: result.limitations,
    pcf,
    extensions: bindingMetadata.extensions,
  });

  const pactValidate =
    context.pactValidate || createPactProductFootprintValidator();
  const pactValidation = validationResult(pactValidate, payload);
  if (!pactValidation.valid) {
    throw new Error(formatValidationErrors(pactValidation.errors));
  }
  return payload;
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function writeOutput(filePath, value) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  if (filePath) {
    fs.writeFileSync(path.resolve(filePath), text);
  } else {
    process.stdout.write(text);
  }
}

function runCli() {
  const command = process.argv[2];
  const inputPath = argument("--input");
  const outputPath = argument("--output");
  const metadataPath = argument("--metadata");
  if (!inputPath || !["import", "export"].includes(command)) {
    throw new Error(
      "Usage: adapter.js <import|export> --input <json> [--metadata <json>] [--output <json>]",
    );
  }

  if (command === "import") {
    const converted = fromPact(readJson(path.resolve(inputPath)));
    if (metadataPath) {
      writeOutput(metadataPath, converted.bindingMetadata);
    }
    writeOutput(outputPath, converted.result);
    return;
  }

  if (!metadataPath) {
    throw new Error("PACT export requires --metadata <json>");
  }
  writeOutput(
    outputPath,
    toPact(
      readJson(path.resolve(inputPath)),
      readJson(path.resolve(metadataPath)),
    ),
  );
}

if (require.main === module) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  DETAILS_EXTENSION_NAME,
  fromPact,
  resultFieldMappings,
  toPact,
};
