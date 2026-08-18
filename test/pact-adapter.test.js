const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const {
  createPactProductFootprintValidator,
  pactOpenApiPath,
  projectRoot,
  readJson,
  validationResult,
} = require("../scripts/lib/validators");
const {
  fromPact,
  resultFieldMappings,
  toPact,
} = require("../bindings/pact-v3.0.3/adapter");
const {
  validatePayload,
} = require("../scripts/validate");

const pactExampleRoot = path.join(
  path.dirname(pactOpenApiPath()),
  "examples",
);
const pactValidate = createPactProductFootprintValidator();

function officialExample(number) {
  return readJson(
    path.join(pactExampleRoot, `example-${number}.json`),
  );
}

test("all official PACT examples import as TIDAS Link PCF profiles", () => {
  for (const number of [1, 2, 3, 4]) {
    const { result } = fromPact(officialExample(number), {
      pactValidate,
    });
    const validation = validatePayload(result);

    assert.equal(result.resultType, "lcia");
    assert.equal(result.profile, "pcf");
    assert.equal(
      validation.valid,
      true,
      JSON.stringify(validation, null, 2),
    );
  }
});

test("all imported PACT examples export as valid PACT payloads", () => {
  for (const number of [1, 2, 3, 4]) {
    const converted = fromPact(officialExample(number), {
      pactValidate,
    });
    const payload = toPact(
      converted.result,
      converted.bindingMetadata,
      { pactValidate },
    );

    assert.equal(validationResult(pactValidate, payload).valid, true);
  }
});

test("mapped PACT carbon values survive an import and export", () => {
  const source = officialExample(4);
  const converted = fromPact(source, { pactValidate });
  const output = toPact(
    converted.result,
    converted.bindingMetadata,
    { pactValidate },
  );

  for (const { pactField } of resultFieldMappings) {
    if (source.pcf[pactField] !== undefined) {
      assert.equal(output.pcf[pactField], source.pcf[pactField]);
    }
  }
});

test("PACT-only fields stay in adapter metadata", () => {
  const source = officialExample(1);
  const converted = fromPact(source, { pactValidate });

  assert.equal(converted.result.specVersion, undefined);
  assert.equal(converted.result.created, undefined);
  assert.equal(
    converted.bindingMetadata.specVersion,
    source.specVersion,
  );
  assert.equal(converted.bindingMetadata.created, source.created);
});

test("PACT export rejects non-PCF TIDAS Link results", () => {
  const lci = readJson(
    path.join(
      path.dirname(__dirname),
      "examples",
      "battery-cell-lci.json",
    ),
  );

  assert.throws(
    () =>
      toPact(lci, {
        specVersion: "3.0.0",
        created: "2026-07-30T00:00:00Z",
      }),
    /requires a TIDAS Link PCF profile/,
  );
});

test("the repository PCF example exports as a valid PACT payload", () => {
  const result = readJson(
    path.join(projectRoot, "examples", "battery-cell-pcf.json"),
  );
  const payload = toPact(
    result,
    {
      specVersion: "3.0.0",
      created: "2026-05-27T00:00:00Z",
    },
    { pactValidate },
  );

  assert.equal(validationResult(pactValidate, payload).valid, true);
});
