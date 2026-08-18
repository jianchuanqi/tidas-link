const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const {
  projectRoot,
  readJson,
} = require("../scripts/lib/validators");
const {
  validatePayload,
} = require("../scripts/validate");

function example(name) {
  return readJson(path.join(projectRoot, "examples", name));
}

function clone(value) {
  return structuredClone(value);
}

test("the LCI, LCIA, and PCF profile examples are valid", () => {
  for (const fileName of [
    "battery-cell-lci.json",
    "battery-cell-lcia.json",
    "battery-cell-pcf.json",
    "battery-pack-pcf.json",
  ]) {
    const result = validatePayload(example(fileName));
    assert.equal(result.valid, true, JSON.stringify(result, null, 2));
  }
});

test("the LCI result contains inventory inputs and outputs", () => {
  const payload = example("battery-cell-lci.json");
  assert.equal(payload.resultType, "lci");
  assert.deepEqual(
    payload.inventoryResults.map(
      (result) => result.inventoryFlow.direction,
    ),
    ["input", "output"],
  );
});

test("the LCIA result represents climate, acidification, and water use", () => {
  const payload = example("battery-cell-lcia.json");
  assert.deepEqual(
    payload.impactResults.map((result) => result.impactCategory),
    ["climate change", "acidification", "water use"],
  );
});

test("the LCIA schema rejects inventory results", () => {
  const payload = example("battery-cell-lcia.json");
  payload.inventoryResults = clone(
    example("battery-cell-lci.json").inventoryResults,
  );

  assert.equal(validatePayload(payload).valid, false);
});

test("the PCF schema requires the main climate-change result", () => {
  const payload = example("battery-cell-pcf.json");
  payload.impactResults = payload.impactResults.filter(
    (result) => result.indicator !== "GWP excluding biogenic uptake",
  );

  assert.equal(validatePayload(payload).valid, false);
});

test("ordinary system-transfer fields are outside the result schemas", () => {
  const payload = example("battery-cell-pcf.json");
  payload.messageId = "message-001";
  payload.sender = "system-a";
  payload.recipient = "system-b";
  payload.deliveryStatus = "delivered";

  const result = validatePayload(payload);
  assert.equal(result.valid, false);
  assert.ok(
    result.schema.errors.some(
      (error) => error.keyword === "additionalProperties",
    ),
  );
});

test("TIDAS references cannot embed complete dataset metadata", () => {
  const payload = example("battery-cell-pcf.json");
  payload.referenceQuantity.referenceFlow = {
    objectType: "flow",
    id: "urn:uuid:8a0e79ce-31b7-4b5b-a1f8-a6ee7992d001",
    version: "01.00.000",
    uri: "https://example.org/tidas/flow.json",
    shortDescription: "Dataset metadata belongs to TIDAS.",
  };

  assert.equal(validatePayload(payload).valid, false);
});

test("reference and validity periods must end after they start", () => {
  const payload = example("battery-cell-pcf.json");
  payload.referencePeriod.end = payload.referencePeriod.start;
  payload.validityPeriod.end = "2025-01-01T00:00:00Z";

  const result = validatePayload(payload);
  assert.equal(result.valid, false);
  assert.equal(result.semantic.errors.length, 2);
});

test("LCA percentage fields must stay between zero and one hundred", () => {
  const payload = example("battery-cell-pcf.json");
  payload.modeling.excludedSharePercent = "101";
  payload.dataQuality.primaryDataShare = "-1";

  const result = validatePayload(payload);
  assert.equal(result.valid, false);
  assert.ok(result.semantic.errors.length >= 1);
});

test("result item identifiers are unique within one result", () => {
  const payload = example("battery-cell-pcf.json");
  payload.reportedParameters[0].resultItemId =
    payload.impactResults[0].resultItemId;

  const result = validatePayload(payload);
  assert.equal(result.valid, false);
  assert.ok(
    result.semantic.errors.some((error) =>
      error.message.includes("unique"),
    ),
  );
});

test("malformed result collections return errors instead of throwing", () => {
  const payload = clone(example("battery-cell-pcf.json"));
  payload.impactResults = {};

  assert.doesNotThrow(() => validatePayload(payload));
  assert.equal(validatePayload(payload).valid, false);
});

test("data owner and result identity are required", () => {
  const payload = example("battery-cell-pcf.json");
  delete payload.dataOwner;
  delete payload.resultId;

  const result = validatePayload(payload);
  assert.equal(result.valid, false);
  assert.ok(
    result.schema.errors.filter((error) => error.keyword === "required")
      .length >= 2,
  );
});
