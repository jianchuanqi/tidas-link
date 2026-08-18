#!/usr/bin/env node

const path = require("path");
const {
  createDraft7Validator,
  formatValidationErrors,
  loadTidasLinkSchemas,
  readJson,
  validationResult,
} = require("./lib/validators");

function schemaContext() {
  const schemas = loadTidasLinkSchemas();
  const baseDependencies = [
    schemas.common,
    schemas.calculationInput,
    schemas.lcaResult,
  ];
  return {
    schemas,
    validateLca: createDraft7Validator(schemas.lcaResult, [
      schemas.common,
      schemas.calculationInput,
    ]),
    validateLci: createDraft7Validator(
      schemas.lciResult,
      baseDependencies,
    ),
    validateLcia: createDraft7Validator(
      schemas.lciaResult,
      baseDependencies,
    ),
    validatePcf: createDraft7Validator(
      schemas.pcfProfile,
      [...baseDependencies, schemas.lciaResult],
    ),
  };
}

function semanticError(instancePath, message) {
  return {
    instancePath,
    keyword: "tidasLinkRule",
    message,
    params: {},
  };
}

function checkPeriod(period, instancePath, errors) {
  if (!period || typeof period !== "object") {
    return;
  }
  const start = Date.parse(period.start);
  const end = Date.parse(period.end);
  if (Number.isFinite(start) && Number.isFinite(end) && start >= end) {
    errors.push(
      semanticError(
        `${instancePath}/end`,
        "must be later than the period start",
      ),
    );
  }
}

function checkPercentage(value, instancePath, errors) {
  if (value === undefined) {
    return;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
    errors.push(
      semanticError(instancePath, "must be between 0 and 100"),
    );
  }
}

function validateLcaSemanticRules(payload) {
  const errors = [];
  checkPeriod(payload.referencePeriod, "/referencePeriod", errors);
  checkPeriod(payload.validityPeriod, "/validityPeriod", errors);
  checkPercentage(
    payload.modeling?.excludedSharePercent,
    "/modeling/excludedSharePercent",
    errors,
  );
  checkPercentage(
    payload.dataQuality?.primaryDataShare,
    "/dataQuality/primaryDataShare",
    errors,
  );

  const resultIds = new Set();
  const resultCollections = [
    "inventoryResults",
    "impactResults",
    "reportedParameters",
  ];
  for (const collectionName of resultCollections) {
    const results = Array.isArray(payload[collectionName])
      ? payload[collectionName]
      : [];
    for (const [index, result] of results.entries()) {
      if (!result || typeof result !== "object") {
        continue;
      }
      const resultPath = `/${collectionName}/${index}`;
      if (resultIds.has(result.resultItemId)) {
        errors.push(
          semanticError(
            `${resultPath}/resultItemId`,
            "must be unique within one LCA result",
          ),
        );
      }
      if (result.resultItemId !== undefined) {
        resultIds.add(result.resultItemId);
      }
      checkPercentage(
        result.uncertainty?.confidenceLevelPercent,
        `${resultPath}/uncertainty/confidenceLevelPercent`,
        errors,
      );
      checkPercentage(
        result.dataQuality?.primaryDataShare,
        `${resultPath}/dataQuality/primaryDataShare`,
        errors,
      );
    }
  }

  const inputIds = new Set();
  const inputs = Array.isArray(payload.calculationInputs)
    ? payload.calculationInputs
    : [];
  for (const [index, input] of inputs.entries()) {
    if (!input || typeof input !== "object") {
      continue;
    }
    if (inputIds.has(input.inputId)) {
      errors.push(
        semanticError(
          `/calculationInputs/${index}/inputId`,
          "must be unique within one LCA result",
        ),
      );
    }
    if (input.inputId !== undefined) {
      inputIds.add(input.inputId);
    }
    if (
      input.sourceResult?.resultId === payload.resultId &&
      input.sourceResult?.resultVersion === payload.resultVersion
    ) {
      errors.push(
        semanticError(
          `/calculationInputs/${index}/sourceResult`,
          "must not reference the containing result and revision",
        ),
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateSemanticRules(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { valid: true, errors: [] };
  }
  return validateLcaSemanticRules(payload);
}

function validatePayload(payload, context = schemaContext()) {
  const validators = {
    lci: context.validateLci,
    lcia: context.validateLcia,
  };
  const validate =
    payload?.profile === "pcf"
      ? context.validatePcf
      : validators[payload?.resultType] || context.validateLca;
  const schema = validationResult(validate, payload);
  const semantic = validateSemanticRules(payload);
  return {
    valid: schema.valid && semantic.valid,
    schema,
    semantic,
  };
}

function runCli() {
  const [command, inputFlag, inputPath] = process.argv.slice(2);
  if (command !== "validate" || inputFlag !== "--input" || !inputPath) {
    throw new Error(
      "Usage: validate.js validate --input <tidas-link-document.json>",
    );
  }

  const result = validatePayload(readJson(path.resolve(inputPath)));
  if (!result.valid) {
    throw new Error(
      formatValidationErrors([
        ...result.schema.errors,
        ...result.semantic.errors,
      ]),
    );
  }
  process.stdout.write("valid\n");
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
  schemaContext,
  validateLcaSemanticRules,
  validatePayload,
  validateSemanticRules,
};
