const crypto = require("node:crypto");
const { execFileSync, spawnSync } = require("node:child_process");

const SCHEMA_ROOT = "static/schemas";
const CLASSIFICATION_PRIORITY = [
  "breaking",
  "manual-review",
  "additive-compatible",
  "compatible-relaxation",
  "documentation-only",
  "unchanged",
];
const CONSTRAINT_KEYS = new Set([
  "additionalProperties",
  "const",
  "contains",
  "exclusiveMaximum",
  "exclusiveMinimum",
  "format",
  "maxItems",
  "maxLength",
  "maxProperties",
  "maximum",
  "minItems",
  "minLength",
  "minProperties",
  "minimum",
  "multipleOf",
  "pattern",
  "patternProperties",
  "required",
  "uniqueItems",
]);
const DOCUMENTATION_KEYS = new Set([
  "$comment",
  "description",
  "examples",
  "title",
]);

function git(root, args, options = {}) {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: options.encoding || "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function gitSucceeds(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  });
  return result.status === 0;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readGitJson(root, ref, filePath) {
  return JSON.parse(git(root, ["show", `${ref}:${filePath}`]));
}

function schemaFiles(root, ref, schemaRoot = SCHEMA_ROOT) {
  const prefix = `${schemaRoot}/`;
  return git(root, ["ls-tree", "-r", "--name-only", ref, "--", schemaRoot])
    .split("\n")
    .filter((filePath) => filePath.startsWith(prefix))
    .filter((filePath) => filePath.endsWith(".json"))
    .filter((filePath) => !filePath.slice(prefix.length).includes("/"))
    .sort();
}

function schemaSnapshot(root, ref, schemaRoot = SCHEMA_ROOT) {
  const files = schemaFiles(root, ref, schemaRoot);
  const entries = files.map((filePath) => {
    const content = git(root, ["show", `${ref}:${filePath}`], {
      encoding: "buffer",
    });
    return {
      path: filePath,
      sha256: sha256(content),
    };
  });
  const manifest = entries
    .map((entry) => `${entry.sha256}  ${entry.path.slice(schemaRoot.length + 1)}\n`)
    .join("");
  return {
    fileCount: entries.length,
    manifestSha256: sha256(manifest),
  };
}

function classifyPath(filePath) {
  if (filePath.startsWith(`${SCHEMA_ROOT}/`) && filePath.endsWith(".json")) {
    return "schema";
  }
  if (
    filePath === "AGENTS.md" ||
    filePath.startsWith(".docpact/") ||
    filePath.startsWith("_docs/agents/")
  ) {
    return "governance";
  }
  if (filePath.startsWith(".github/workflows/")) {
    return "ci";
  }
  if (filePath.startsWith("docs/") || filePath.endsWith(".md")) {
    return "documentation";
  }
  if (
    filePath.startsWith("scripts/") ||
    filePath.startsWith("src/") ||
    filePath.startsWith("tests/") ||
    filePath.startsWith("test/")
  ) {
    return "tooling-or-validation";
  }
  return "other";
}

function changedFiles(root, fromCommit, toCommit) {
  const output = git(root, [
    "diff",
    "--name-status",
    "--no-renames",
    "-z",
    `${fromCommit}..${toCommit}`,
    "--",
  ]);
  const fields = output.split("\0").filter(Boolean);
  const changes = [];
  for (let index = 0; index < fields.length; index += 2) {
    const status = fields[index];
    const filePath = fields[index + 1];
    if (!filePath) {
      throw new Error("Unable to parse the TIDAS changed-file list");
    }
    changes.push({
      path: filePath,
      status,
      category: classifyPath(filePath),
    });
  }
  return changes.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
}

function pointer(pathParts) {
  if (pathParts.length === 0) {
    return "/";
  }
  return `/${pathParts
    .map((part) => String(part).replaceAll("~", "~0").replaceAll("/", "~1"))
    .join("/")}`;
}

function difference(pathParts, change, classification, before, after) {
  const output = {
    instancePath: pointer(pathParts),
    change,
    classification,
  };
  if (before !== undefined) {
    output.before = before;
  }
  if (after !== undefined) {
    output.after = after;
  }
  return output;
}

function setDifference(left, right) {
  const rightValues = new Set(right.map((value) => JSON.stringify(value)));
  return left.filter((value) => !rightValues.has(JSON.stringify(value)));
}

function compareArray(before, after, pathParts) {
  const key = pathParts.at(-1);
  if (key === "required") {
    const added = setDifference(after, before);
    const removed = setDifference(before, after);
    return [
      ...added.map((value) =>
        difference(
          [...pathParts, value],
          "required-value-added",
          "breaking",
          undefined,
          value,
        ),
      ),
      ...removed.map((value) =>
        difference(
          [...pathParts, value],
          "required-value-removed",
          "compatible-relaxation",
          value,
          undefined,
        ),
      ),
    ];
  }
  if (key === "enum") {
    const added = setDifference(after, before);
    const removed = setDifference(before, after);
    return [
      ...added.map((value) =>
        difference(
          [...pathParts, value],
          "enum-value-added",
          "additive-compatible",
          undefined,
          value,
        ),
      ),
      ...removed.map((value) =>
        difference(
          [...pathParts, value],
          "enum-value-removed",
          "breaking",
          value,
          undefined,
        ),
      ),
    ];
  }
  if (before.length === after.length) {
    return before.flatMap((value, index) =>
      compareJson(value, after[index], [...pathParts, index]),
    );
  }
  if (JSON.stringify(before) === JSON.stringify(after)) {
    return [];
  }
  return [
    difference(pathParts, "array-changed", "manual-review", before, after),
  ];
}

function classifyAddedKey(pathParts) {
  const key = pathParts.at(-1);
  const parentKey = pathParts.at(-2);
  if (DOCUMENTATION_KEYS.has(key)) {
    return "documentation-only";
  }
  if (parentKey === "properties" || parentKey === "$defs") {
    return "additive-compatible";
  }
  if (CONSTRAINT_KEYS.has(key)) {
    return "breaking";
  }
  return "manual-review";
}

function classifyRemovedKey(pathParts) {
  const key = pathParts.at(-1);
  const parentKey = pathParts.at(-2);
  if (DOCUMENTATION_KEYS.has(key)) {
    return "documentation-only";
  }
  if (parentKey === "properties" || parentKey === "$defs") {
    return "breaking";
  }
  if (CONSTRAINT_KEYS.has(key)) {
    return "compatible-relaxation";
  }
  return "manual-review";
}

function compareJson(before, after, pathParts = []) {
  if (Array.isArray(before) && Array.isArray(after)) {
    return compareArray(before, after, pathParts);
  }
  if (
    before &&
    after &&
    typeof before === "object" &&
    typeof after === "object" &&
    !Array.isArray(before) &&
    !Array.isArray(after)
  ) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    const differences = [];
    for (const key of keys) {
      const childPath = [...pathParts, key];
      if (!Object.hasOwn(before, key)) {
        differences.push(
          difference(
            childPath,
            "added",
            classifyAddedKey(childPath),
            undefined,
            after[key],
          ),
        );
      } else if (!Object.hasOwn(after, key)) {
        differences.push(
          difference(
            childPath,
            "removed",
            classifyRemovedKey(childPath),
            before[key],
            undefined,
          ),
        );
      } else {
        differences.push(...compareJson(before[key], after[key], childPath));
      }
    }
    return differences;
  }
  if (Object.is(before, after)) {
    return [];
  }
  const key = pathParts.at(-1);
  const classification = DOCUMENTATION_KEYS.has(key)
    ? "documentation-only"
    : "breaking";
  return [difference(pathParts, "changed", classification, before, after)];
}

function highestClassification(classifications) {
  for (const classification of CLASSIFICATION_PRIORITY) {
    if (classifications.includes(classification)) {
      return classification;
    }
  }
  return "unchanged";
}

function schemaChange(root, fromCommit, toCommit, change) {
  if (change.status === "A") {
    const afterSha256 = sha256(
      git(root, ["show", `${toCommit}:${change.path}`], { encoding: "buffer" }),
    );
    return {
      path: change.path,
      status: change.status,
      classification: "additive-compatible",
      afterSha256,
      differences: [],
    };
  }
  if (change.status === "D") {
    const beforeSha256 = sha256(
      git(root, ["show", `${fromCommit}:${change.path}`], {
        encoding: "buffer",
      }),
    );
    return {
      path: change.path,
      status: change.status,
      classification: "breaking",
      beforeSha256,
      differences: [],
    };
  }
  const before = readGitJson(root, fromCommit, change.path);
  const after = readGitJson(root, toCommit, change.path);
  const differences = compareJson(before, after);
  return {
    path: change.path,
    status: change.status,
    classification: highestClassification(
      differences.map((item) => item.classification),
    ),
    beforeSha256: sha256(
      git(root, ["show", `${fromCommit}:${change.path}`], {
        encoding: "buffer",
      }),
    ),
    afterSha256: sha256(
      git(root, ["show", `${toCommit}:${change.path}`], {
        encoding: "buffer",
      }),
    ),
    differences,
  };
}

function assessTidasUpstream(root, fromCommit, toCommit) {
  if (!root) {
    throw new Error("Provide --tidas-root or set TIDAS_ROOT");
  }
  if (!fromCommit || !toCommit) {
    throw new Error("Both the previous and candidate TIDAS commits are required");
  }
  if (!gitSucceeds(root, ["cat-file", "-e", `${fromCommit}^{commit}`])) {
    throw new Error(`Previous TIDAS commit is unavailable: ${fromCommit}`);
  }
  if (!gitSucceeds(root, ["cat-file", "-e", `${toCommit}^{commit}`])) {
    throw new Error(`Candidate TIDAS commit is unavailable: ${toCommit}`);
  }
  if (!gitSucceeds(root, ["merge-base", "--is-ancestor", fromCommit, toCommit])) {
    throw new Error("Candidate TIDAS commit is not a descendant of the previous pin");
  }

  const files = changedFiles(root, fromCommit, toCommit);
  const schemaChanges = files
    .filter((change) => change.category === "schema")
    .map((change) => schemaChange(root, fromCommit, toCommit, change));
  const classification = highestClassification(
    schemaChanges.map((change) => change.classification),
  );

  return {
    fromCommit,
    toCommit,
    ancestry: "fast-forward",
    commitCount: Number(
      git(root, ["rev-list", "--count", `${fromCommit}..${toCommit}`]).trim(),
    ),
    commits: git(root, ["rev-list", "--reverse", `${fromCommit}..${toCommit}`])
      .trim()
      .split("\n")
      .filter(Boolean),
    changedFiles: files,
    schemaChanges,
    schemaCompatibility:
      schemaChanges.length === 0 ? "no-schema-change" : classification,
    schemaSnapshots: {
      from: schemaSnapshot(root, fromCommit),
      to: schemaSnapshot(root, toCommit),
    },
  };
}

module.exports = {
  assessTidasUpstream,
  compareJson,
  highestClassification,
  schemaSnapshot,
};
