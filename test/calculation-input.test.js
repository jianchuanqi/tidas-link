const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const {
  projectRoot,
  readJson,
} = require("../scripts/lib/validators");
const {
  schemaContext,
  validatePayload,
} = require("../scripts/validate");

const context = schemaContext();

function example() {
  return readJson(
    path.join(projectRoot, "examples", "battery-pack-pcf.json"),
  );
}

function clone(value) {
  return structuredClone(value);
}

test("calculation inputs are embedded in the result that used them", () => {
  const payload = example();
  const result = validatePayload(payload, context);

  assert.equal(result.valid, true, JSON.stringify(result, null, 2));
  assert.equal(payload.calculationInputs.length, 2);
  assert.equal(
    payload.calculationInputs[0].sourceResult.resultId,
    "urn:uuid:4f6569e0-79b1-4e21-9b60-15d6e6d41101",
  );
  assert.equal(
    payload.calculationInputs[1].sourceDataset.objectType,
    "process",
  );
});

test("the containing result is the target of every calculation input", () => {
  const payload = example();
  assert.ok(
    payload.calculationInputs.every(
      (input) => input.targetResult === undefined,
    ),
  );
});

test("ordinary transfer and workflow fields are rejected from inputs", () => {
  const payload = clone(example());
  payload.calculationInputs[0].messageId = "message-001";
  payload.calculationInputs[0].authorization = "granted";

  const result = validatePayload(payload, context);
  assert.equal(result.valid, false);
  assert.ok(
    result.schema.errors.some(
      (error) => error.keyword === "additionalProperties",
    ),
  );
});

test("an input identifies either a result or a dataset, not both", () => {
  const payload = clone(example());
  payload.calculationInputs[0].sourceDataset = clone(
    payload.calculationInputs[1].sourceDataset,
  );

  assert.equal(validatePayload(payload, context).valid, false);
});

test("a calculation input cannot reference its containing result", () => {
  const payload = clone(example());
  payload.calculationInputs[0].sourceResult = {
    resultId: payload.resultId,
    resultVersion: payload.resultVersion,
  };

  const result = validatePayload(payload, context);
  assert.equal(result.valid, false);
  assert.equal(
    result.semantic.errors[0].instancePath,
    "/calculationInputs/0/sourceResult",
  );
});

test("actual quantity and calculation position are required", () => {
  const payload = clone(example());
  delete payload.calculationInputs[0].usedQuantity;
  delete payload.calculationInputs[0].calculationPosition;

  const result = validatePayload(payload, context);
  assert.equal(result.valid, false);
  const missingProperties = new Set(
    result.schema.errors
      .filter((error) => error.keyword === "required")
      .map((error) => error.params.missingProperty),
  );
  assert.ok(missingProperties.has("usedQuantity"));
  assert.ok(missingProperties.has("calculationPosition"));
});

test("calculation input identifiers are unique within one result", () => {
  const payload = clone(example());
  payload.calculationInputs[1].inputId =
    payload.calculationInputs[0].inputId;

  const result = validatePayload(payload, context);
  assert.equal(result.valid, false);
  assert.ok(
    result.semantic.errors.some((error) =>
      error.instancePath.endsWith("/inputId"),
    ),
  );
});
