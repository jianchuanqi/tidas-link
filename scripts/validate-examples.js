#!/usr/bin/env node

const path = require("path");
const {
  formatValidationErrors,
  projectRoot,
  readJson,
} = require("./lib/validators");
const {
  schemaContext,
  validatePayload,
} = require("./validate");

const context = schemaContext();
const exampleNames = [
  "battery-cell-lci.json",
  "battery-cell-pcf.json",
  "battery-cell-lcia.json",
  "battery-pack-pcf.json",
];

let failed = false;
for (const fileName of exampleNames) {
  const filePath = path.join(projectRoot, "examples", fileName);
  const result = validatePayload(readJson(filePath), context);
  if (result.valid) {
    console.log(`examples/${fileName} valid`);
    continue;
  }

  failed = true;
  console.error(`examples/${fileName} invalid`);
  console.error(
    formatValidationErrors([
      ...result.schema.errors,
      ...result.semantic.errors,
    ]),
  );
}

if (failed) {
  process.exit(1);
}
