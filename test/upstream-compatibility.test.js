const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");
const {
  assessTidasUpstream,
} = require("../scripts/lib/upstream-assessment");
const {
  validateDecision,
} = require("../scripts/assess-tidas-upstream");
const {
  projectRoot,
  readJson,
} = require("../scripts/lib/validators");

function git(root, args) {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  }).trim();
}

function writeJson(root, relativePath, value) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function commit(root, message) {
  git(root, ["add", "--", "static/schemas/example.json"]);
  git(root, ["commit", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]);
}

function temporaryTidasRepository() {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "tidas-link-upstream-assessment-"),
  );
  git(root, ["init"]);
  git(root, ["config", "user.name", "TIDAS Link Test"]);
  git(root, ["config", "user.email", "tidas-link-test@example.invalid"]);
  writeJson(root, "static/schemas/example.json", {
    type: "object",
    additionalProperties: false,
    properties: {
      locator: {
        type: "string",
        format: "uri",
      },
    },
  });
  const baseline = commit(root, "baseline");
  return { root, baseline };
}

test("the detector distinguishes compatible relaxation from breaking changes", () => {
  const fixture = temporaryTidasRepository();
  try {
    writeJson(fixture.root, "static/schemas/example.json", {
      type: "object",
      additionalProperties: false,
      properties: {
        locator: {
          type: "string",
        },
      },
    });
    const relaxed = commit(fixture.root, "relax URI requirement");
    const relaxation = assessTidasUpstream(
      fixture.root,
      fixture.baseline,
      relaxed,
    );
    assert.equal(
      relaxation.schemaCompatibility,
      "compatible-relaxation",
    );
    assert.equal(
      relaxation.schemaChanges[0].differences[0].instancePath,
      "/properties/locator/format",
    );

    writeJson(fixture.root, "static/schemas/example.json", {
      type: "object",
      additionalProperties: false,
      required: ["locator"],
      properties: {
        locator: {
          type: "string",
        },
      },
    });
    const breaking = commit(fixture.root, "require locator");
    const breakingAssessment = assessTidasUpstream(
      fixture.root,
      relaxed,
      breaking,
    );
    assert.equal(breakingAssessment.schemaCompatibility, "breaking");
    assert.ok(
      breakingAssessment.schemaChanges[0].differences.some(
        (item) => item.change === "added" && item.instancePath === "/required",
      ),
    );
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("the detector fails closed when a fixed commit is unavailable", () => {
  const fixture = temporaryTidasRepository();
  try {
    assert.throws(
      () =>
        assessTidasUpstream(
          fixture.root,
          fixture.baseline,
          "0000000000000000000000000000000000000000",
        ),
      /Candidate TIDAS commit is unavailable/,
    );
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("the recorded assessment covers every required TIDAS-Link and SSCM surface", () => {
  const assessment = readJson(
    path.join(
      projectRoot,
      "docs",
      "compatibility-assessments",
      "tidas-e26953d-to-073e182.json",
    ),
  );
  assert.equal(assessment.decision.status, "synchronized");
  assert.equal(
    assessment.architectureBaseline.version,
    "architecture-v0.1.1",
  );
  assert.deepEqual(assessment.provenance.copiedFiles, []);
  assert.equal(
    assessment.decision.compatibility,
    assessment.detection.schemaCompatibility,
  );
  assert.deepEqual(
    assessment.tidasLinkImpact.map((item) => item.surface).sort(),
    ["bindings", "examples", "schemas", "validators"],
  );
  assert.deepEqual(
    assessment.sscmImpactMatrix.map((item) => item.scope).sort(),
    [
      "connector-plugin",
      "contracts",
      "edl-platform",
      "exchange-platform",
      "managed-profile",
    ],
  );
  assert.ok(
    assessment.sscmImpactMatrix.every(
      (item) => item.followUpIssueRequired === false,
    ),
  );
  assert.ok(assessment.failureHandlingEvidence.length >= 3);
});

test("a manual-review result cannot be selected as the synchronized baseline", () => {
  const assessment = readJson(
    path.join(
      projectRoot,
      "docs",
      "compatibility-assessments",
      "tidas-e26953d-to-073e182.json",
    ),
  );
  assessment.detection.schemaCompatibility = "manual-review";
  assessment.decision.compatibility = "manual-review";

  assert.throws(
    () => validateDecision(assessment),
    /explicit compatibility classification/,
  );
});
