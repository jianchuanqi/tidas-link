#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const baselinePath = path.join(projectRoot, "docs", "compatibility-baseline.json");
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const tidasRoot = process.env.TIDAS_ROOT || "/Users/jianchuan/Dev/tidas";
const pactRoot =
  process.env.PACT_ROOT || "/Users/jianchuan/Dev/data-exchange-protocol";
const failures = [];

function git(root, args) {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  }).trim();
}

function sha256(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

function checkEqual(label, actual, expected) {
  if (actual !== expected) {
    failures.push(`${label}: expected ${expected}, got ${actual}`);
    return;
  }
  console.log(`${label} ok`);
}

function schemaManifest(root, relativeRoot) {
  const schemaRoot = path.join(root, relativeRoot);
  const files = fs
    .readdirSync(schemaRoot)
    .filter((name) => name.endsWith(".json"))
    .sort();
  const manifest = files
    .map((name) => `${sha256(path.join(schemaRoot, name))}  ${name}\n`)
    .join("");
  return {
    fileCount: files.length,
    digest: crypto.createHash("sha256").update(manifest).digest("hex"),
  };
}

if (!fs.existsSync(tidasRoot)) {
  failures.push(`TIDAS_ROOT does not exist: ${tidasRoot}`);
} else {
  checkEqual(
    "TIDAS commit",
    git(tidasRoot, ["rev-parse", "HEAD"]),
    baseline.tidas.commit,
  );

  const manifest = schemaManifest(tidasRoot, baseline.tidas.schemaSnapshotRoot);
  checkEqual(
    "TIDAS schema file count",
    String(manifest.fileCount),
    String(baseline.tidas.schemaFileCount),
  );
  checkEqual(
    "TIDAS schema manifest",
    manifest.digest,
    baseline.tidas.schemaManifestSha256,
  );

  for (const snapshot of baseline.tidas.schemaSnapshots) {
    const filePath = path.join(tidasRoot, snapshot.path);
    if (!fs.existsSync(filePath)) {
      failures.push(`TIDAS schema missing: ${snapshot.path}`);
      continue;
    }
    checkEqual(
      `TIDAS ${snapshot.path}`,
      sha256(filePath),
      snapshot.sha256,
    );
  }
}

if (!fs.existsSync(pactRoot)) {
  failures.push(`PACT_ROOT does not exist: ${pactRoot}`);
} else {
  checkEqual(
    `PACT ${baseline.pact.tag} commit`,
    git(pactRoot, ["rev-list", "-n", "1", baseline.pact.tag]),
    baseline.pact.commit,
  );
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log("Compatibility baseline verified");
