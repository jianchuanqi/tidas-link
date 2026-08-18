const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const {
  loadPactOpenApi,
  projectRoot,
  readJson,
} = require("../scripts/lib/validators");
const {
  resultFieldMappings,
} = require("../bindings/pact-v3.0.3/adapter");

const scopePath = path.join(
  projectRoot,
  "bindings",
  "pact-v3.0.3",
  "field-scope.json",
);
const methodScopePath = path.join(
  projectRoot,
  "bindings",
  "pact-v3.0.3",
  "method-scope.json",
);

function sorted(values) {
  return [...values].sort();
}

test("PACT Binding classifies every official ProductFootprint and CarbonFootprint field", () => {
  const openApi = loadPactOpenApi();
  const scope = readJson(scopePath);

  assert.deepEqual(
    sorted(scope.productFootprintFields.map((row) => row.field)),
    sorted(Object.keys(openApi.components.schemas.ProductFootprint.properties)),
  );
  assert.deepEqual(
    sorted(scope.carbonFootprintFields.map((row) => row.field)),
    sorted(Object.keys(openApi.components.schemas.CarbonFootprint.properties)),
  );
});

test("PACT field classification uses only declared layers", () => {
  const scope = readJson(scopePath);
  const methodScope = readJson(methodScopePath);
  const openApi = loadPactOpenApi();
  const allowed = new Set(Object.keys(scope.definitions));
  const rows = [
    ...scope.productFootprintFields,
    ...scope.carbonFootprintFields,
  ];

  assert.ok(scope.systemTransferFields.length > 0);
  assert.ok(rows.every((row) => allowed.has(row.scope)));
  assert.equal(
    new Set(scope.productFootprintFields.map((row) => row.field)).size,
    scope.productFootprintFields.length,
  );
  assert.equal(
    new Set(scope.carbonFootprintFields.map((row) => row.field)).size,
    scope.carbonFootprintFields.length,
  );
  const carbonScopeByField = new Map(
    scope.carbonFootprintFields.map((row) => [row.field, row]),
  );
  for (const mapping of resultFieldMappings) {
    assert.equal(
      carbonScopeByField.get(mapping.pactField)?.linkTarget,
      mapping.target,
    );
  }

  const officialOperations = [];
  for (const [operationPath, pathItem] of Object.entries(openApi.paths)) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      if (pathItem[method]) {
        officialOperations.push({
          method: method.toUpperCase(),
          path: operationPath,
        });
      }
    }
  }
  assert.deepEqual(
    sorted(
      methodScope.openApiOperations.map(
        (operation) => `${operation.method} ${operation.path}`,
      ),
    ),
    sorted(
      officialOperations.map(
        (operation) => `${operation.method} ${operation.path}`,
      ),
    ),
  );

  const officialEventTypes = openApi.paths["/3/events"].post.requestBody
    .content["application/cloudevents+json"].schema.oneOf.map(
      (entry) => entry.$ref.split("/").at(-1),
    );
  assert.deepEqual(
    sorted(methodScope.eventMappings.map((mapping) => mapping.pactEvent)),
    sorted(officialEventTypes),
  );
  assert.ok(
    methodScope.eventMappings.every((mapping) =>
      Array.isArray(mapping.tidasLinkRecords),
    ),
  );
  assert.ok(methodScope.restSpecificationRequirements.length > 0);
});
