const fs = require("fs");
const path = require("path");
const AjvDraft7 = require("ajv");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const YAML = require("yaml");

const projectRoot = path.resolve(__dirname, "..", "..");
const defaultPactRoot = "/Users/jianchuan/Dev/data-exchange-protocol";
const pactOpenApiRelativePath = path.join("spec", "v3", "openapi.yaml");

const schemaPaths = {
  common: path.join(projectRoot, "schemas", "common.json"),
  calculationInput: path.join(
    projectRoot,
    "schemas",
    "calculation-input.json",
  ),
  lcaResult: path.join(projectRoot, "schemas", "lca-result.json"),
  lciResult: path.join(projectRoot, "schemas", "lci-result.json"),
  lciaResult: path.join(projectRoot, "schemas", "lcia-result.json"),
  pcfProfile: path.join(projectRoot, "schemas", "pcf-profile.json"),
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadTidasLinkSchemas() {
  return Object.fromEntries(
    Object.entries(schemaPaths).map(([name, filePath]) => [
      name,
      readJson(filePath),
    ]),
  );
}

function pactRoot() {
  return process.env.PACT_ROOT || defaultPactRoot;
}

function pactOpenApiPath() {
  return path.join(pactRoot(), pactOpenApiRelativePath);
}

function loadPactOpenApi() {
  const filePath = pactOpenApiPath();
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `PACT 3.0.3 OpenAPI source not found at ${filePath}. Set PACT_ROOT to the pinned data-exchange-protocol checkout.`,
    );
  }
  return YAML.parse(fs.readFileSync(filePath, "utf8"));
}

function configureFormats(ajv) {
  addFormats(ajv);
  ajv.addFormat("urn", {
    type: "string",
    validate: (value) => /^urn:/i.test(value),
  });
  ajv.addFormat("decimal", {
    type: "string",
    validate: (value) => /^[+-]?\d+(?:\.\d+)?$/.test(value),
  });
  return ajv;
}

function createDraft7Validator(schema, additionalSchemas = []) {
  const ajv = configureFormats(
    new AjvDraft7({
      allErrors: true,
      strict: true,
    }),
  );
  for (const additionalSchema of additionalSchemas) {
    ajv.addSchema(additionalSchema);
  }
  return ajv.compile(schema);
}

function createPactProductFootprintValidator(openApi = loadPactOpenApi()) {
  const ajv = configureFormats(
    new Ajv2020({
      allErrors: true,
      strict: false,
    }),
  );
  return ajv.compile({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $ref: "#/components/schemas/ProductFootprint",
    components: openApi.components,
  });
}

function validationResult(validate, data) {
  const valid = validate(data);
  return {
    valid,
    errors: valid ? [] : structuredClone(validate.errors || []),
  };
}

function formatValidationErrors(errors) {
  return errors
    .map((error) => {
      const location = error.instancePath || "/";
      return `${location} ${error.message}`;
    })
    .join("\n");
}

module.exports = {
  createDraft7Validator,
  createPactProductFootprintValidator,
  formatValidationErrors,
  loadPactOpenApi,
  loadTidasLinkSchemas,
  pactOpenApiPath,
  projectRoot,
  readJson,
  schemaPaths,
  validationResult,
};
