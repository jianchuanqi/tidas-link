const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
  projectRoot,
  readJson,
} = require("../scripts/lib/validators");

test("the schema set contains the shared, input, and result schemas", () => {
  const schemaFiles = fs
    .readdirSync(path.join(projectRoot, "schemas"))
    .filter((name) => name.endsWith(".json"))
    .sort();

  assert.deepEqual(schemaFiles, [
    "calculation-input.json",
    "common.json",
    "lca-result.json",
    "lci-result.json",
    "lcia-result.json",
    "pcf-profile.json",
  ]);

  for (const fileName of schemaFiles) {
    const schema = readJson(
      path.join(projectRoot, "schemas", fileName),
    );
    assert.ok(schema.$id.endsWith(`/${fileName}`));
  }
});
