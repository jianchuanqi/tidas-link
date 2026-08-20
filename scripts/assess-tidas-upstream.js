#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { assessTidasUpstream } = require("./lib/upstream-assessment");

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readAssessment(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function validateDecision(assessment) {
  assert.equal(
    assessment.source.previousCommit,
    assessment.detection.fromCommit,
    "Assessment previous commit does not match the detection",
  );
  assert.equal(
    assessment.source.candidateCommit,
    assessment.detection.toCommit,
    "Assessment candidate commit does not match the detection",
  );
  assert.equal(
    assessment.decision.compatibility,
    assessment.detection.schemaCompatibility,
    "Compatibility decision does not match the detected Schema class",
  );
  assert.equal(
    assessment.decision.status,
    "synchronized",
    "An assessment selected by the compatibility baseline must be synchronized",
  );
  if (
    assessment.detection.schemaCompatibility === "manual-review"
  ) {
    assert.fail(
      "Manual-review changes require an explicit compatibility classification before synchronization",
    );
  }
  if (assessment.detection.schemaCompatibility === "breaking") {
    assert.equal(
      assessment.decision.migrationCompleted,
      true,
      "Breaking changes cannot synchronize without completed migration evidence",
    );
    assert.equal(
      assessment.decision.deprecationRequired,
      true,
      "Breaking changes require a recorded deprecation plan",
    );
  }
  const allowedImpactStatuses = new Set([
    "unaffected",
    "verification-only",
    "change-required",
    "blocked",
  ]);
  const requiredLinkSurfaces = new Set([
    "schemas",
    "bindings",
    "examples",
    "validators",
  ]);
  for (const item of assessment.tidasLinkImpact || []) {
    assert.ok(
      allowedImpactStatuses.has(item.status),
      `Unknown TIDAS-Link impact status: ${item.status}`,
    );
    assert.ok(
      !["change-required", "blocked"].includes(item.status),
      `Unresolved TIDAS-Link impact cannot synchronize: ${item.surface}`,
    );
    requiredLinkSurfaces.delete(item.surface);
  }
  assert.equal(
    requiredLinkSurfaces.size,
    0,
    `Missing TIDAS-Link impact surfaces: ${[...requiredLinkSurfaces].join(", ")}`,
  );
  const requiredSscmScopes = new Set([
    "contracts",
    "connector-plugin",
    "exchange-platform",
    "edl-platform",
    "managed-profile",
  ]);
  for (const item of assessment.sscmImpactMatrix || []) {
    assert.ok(
      allowedImpactStatuses.has(item.status),
      `Unknown SSCM impact status: ${item.status}`,
    );
    requiredSscmScopes.delete(item.scope);
  }
  assert.equal(
    requiredSscmScopes.size,
    0,
    `Missing SSCM impact scopes: ${[...requiredSscmScopes].join(", ")}`,
  );
}

function run() {
  const root = argument("--tidas-root") || process.env.TIDAS_ROOT;
  const baselinePath = argument("--verify-baseline");
  const baseline = baselinePath ? readAssessment(baselinePath) : undefined;
  const verificationPath =
    argument("--verify") || baseline?.tidas?.assessment;
  const assessment = verificationPath
    ? readAssessment(verificationPath)
    : undefined;
  if (baseline) {
    assert.equal(
      baseline.tidas.commit,
      assessment.source.candidateCommit,
      "Compatibility baseline and assessment candidate commit disagree",
    );
    assert.equal(
      baseline.tidas.previousCommit,
      assessment.source.previousCommit,
      "Compatibility baseline and assessment previous commit disagree",
    );
  }
  const fromCommit =
    argument("--from") || assessment?.source?.previousCommit;
  const toCommit =
    argument("--to") || assessment?.source?.candidateCommit;
  const detected = assessTidasUpstream(root, fromCommit, toCommit);

  if (verificationPath) {
    validateDecision(assessment);
    assert.deepStrictEqual(
      detected,
      assessment.detection,
      `Recorded upstream assessment does not match ${verificationPath}`,
    );
    process.stdout.write(
      `TIDAS upstream assessment verified: ${fromCommit}..${toCommit}\n`,
    );
    return;
  }

  process.stdout.write(`${JSON.stringify(detected, null, 2)}\n`);
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { validateDecision };
