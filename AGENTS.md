# AGENTS.md — TIDAS Link

## Engineering OS authority and architecture version selection

- Authority repository: [jianchuanqi/tiangong-sscm-engineering-os](https://github.com/jianchuanqi/tiangong-sscm-engineering-os)
- Selection rule: at the start of every task, when resuming an open task, and whenever the baseline is checked, re-read the authority repository's published immutable tags matching `architecture-v<MAJOR>.<MINOR>.<PATCH>`; compare MAJOR, MINOR, and PATCH numerically and select the highest version. This file must not hard-code a current version, entrypoint, or commit.
- Resolved task baseline: after selecting the highest tag, the current Issue must pin that concrete tag, the `docs/architecture-entrypoint.md` permalink under the same tag, and the full Engineering OS commit obtained by dereferencing the tag.

Do not substitute `main`, `latest`, “current version,” tag publication date, lexical sorting, a lower version, or any other movable reference for this resolution. When a higher version is published, every open task must re-resolve and upgrade before work resumes; completed tasks retain their original baseline for historical audit. This file states only local repository rules and does not copy the full Engineering OS.

## Task architecture baseline

Every SSCM Issue must apply the rule above and pin the then-highest published immutable architecture tag, entrypoint under the same tag, and dereferenced full commit. Revalidate at task start and whenever an open task resumes; if a higher version has been published, upgrade the baseline and recheck the task before continuing. Completed tasks retain their original baseline for historical audit. Stop and request a decision if the highest version cannot be determined, the task baseline is missing or not highest, the three values disagree, or the baseline conflicts with repository boundaries.

## Project Identity

- Project name: TIDAS Link
- Project type: **Compatibility Layer**
- Deployment position: not independently deployed; schemas, validators, and
  bindings are consumed by platforms or adapters at an explicitly selected
  version.
- DSH position: does not run in DeepSeek Harness and has no fixed DSH Plugin.
- Role: a lightweight schema set for exchanging LCI and LCIA results,
  including the PCF profile and the upstream results or datasets actually
  used in a calculation
- Upstream dependency: `jianchuanqi/tidas`, a read-only external semantic
  upstream
- PACT Binding source: `wbcsd/data-exchange-protocol`, currently pinned by
  `docs/compatibility-baseline.json`

## This repository owns

- LCI, LCIA, and PCF result schemas and `calculationInputs` schemas.
- Shared result types, mappings, examples, validators, the PACT Binding and
  adapter, and the recorded compatibility baseline.
- Explicit compatibility assessment when a pinned TIDAS semantic baseline or
  an external protocol version changes.
- Versioned schemas, examples, validators, bindings, adapters, and
  compatibility evidence produced from those inputs.

## This repository does not own

- SSCM shared Contracts; TIDAS-Link is not part of
  `tiangong-sscm-contracts`.
- TIDAS's complete process, flow, source, unit-group, lifecycle-model, or LCIA
  method datasets.
- Message transport, identity, authentication, authorization, pagination,
  delivery state, storage, audit payloads, or business workflows.
- DeepSeek Harness Runtime, any Connector Plugin or Bundle, Managed Profile,
  independent platform service, platform master data, or enterprise LCA
  results processed at runtime.

## Boundaries

- Keep TIDAS Link separate from TIDAS.
- Treat TIDAS as a read-only upstream dependency. Never modify TIDAS schemas,
  architecture, or repository files from this project.
- TIDAS owns full process, flow, source, unit-group, lifecycle-model, and LCIA
  method datasets.
- Organize TIDAS Link as a schema set with shared types, calculation inputs,
  a common LCA result, strict LCI and LCIA result schemas, and a PCF profile
  under LCIA.
- Store actual upstream use under the target result's `calculationInputs`.
  Do not create a separate target/source workflow document for the same fact.
- Keep ordinary information-system transfer fields outside TIDAS Link,
  including message routing, sender and recipient, authentication,
  authorization, pagination, delivery state, retry, error, storage, and audit.
- Distinguish a result field from a similarly named message field. For example,
  `resultId` is in scope while `messageId` is not; `resultStatus` is in scope
  while `deliveryStatus` is not.
- Keep PACT REST, CloudEvents, exact PACT field names, and version-specific
  conversion rules in the PACT Binding.
- Keep requests, delivery workflow, trace questions and answers, notifications,
  supply-chain decision methods, authorization, and platform execution outside
  TIDAS Link.
- Do not add a workflow record when the same project need can be met by an LCA
  result or its calculation inputs.
- Do not claim complete PACT API or Methodology conformance without separate
  evidence.

## Cross-repository relationships

- `tidas` remains an external, read-only semantic upstream. This repository is
  not its fork; upstream changes are handled through the compatibility
  baseline, a recorded difference, and an impact assessment.
- The PACT specification is an external protocol source. Version-specific
  conversion remains in the PACT Binding and does not redefine the common
  TIDAS-Link result model.
- Exchange, Eco Design Label, and other platforms or explicitly identified DSH
  Plugins may select and consume a TIDAS-Link version. Consumption does not
  make TIDAS-Link a platform, SSCM Contract, DSH Plugin, or Bundle.
- Runtime enterprise LCA results remain with the platform or user environment
  that processes them; this repository owns only schemas and public,
  synthetic, or clearly dummy examples.
- This repository is an original standalone implementation that references
  pinned TIDAS and PACT baselines; it does not copy either upstream in full.

## Required reading before work

Before any task, read:

1. This file and the complete current Issue, including its Parent Initiative,
   dependencies, and source list.
2. `README.md`, `package.json`, `package-lock.json`, relevant workflows,
   relevant repository documentation, and existing build/test instructions.
3. Every file proposed for modification and its adjacent documentation and
   tests.

Before any cross-repository Issue, also read these documents in order from the
Task architecture baseline fixed by the current Issue:

1. `docs/architecture-entrypoint.md`
2. `docs/system-context.md`
3. The current and related repository entries in
   `docs/repository-catalog.md`
4. The relevant call paths in `docs/integration-map.md`
5. `docs/migration-source-map.md` when existing code or data is involved
6. `docs/issue-routing.md`
7. `docs/architecture-versioning.md`
8. The `docs/migration-roadmap.md` and/or `docs/release-trains.md` files named
   by the Issue

## Stop conditions

Stop the affected work, record the facts, and request a decision from the
appropriate repository owner or Engineering OS maintainer if any of the
following applies:

- The architecture tag, entrypoint, or commit fixed by the current Issue is
  inaccessible, the three do not agree, or local facts conflict with its Task
  architecture baseline. Do not guess or substitute a movable reference.
- The task would change this repository's Compatibility Layer role, merge it
  into Contracts, make it a fixed DSH Plugin, or blur Runtime, Plugin,
  independent-platform, Contract, or TIDAS ownership boundaries.
- Completion requires modifying another repository. Establish or reference the
  correctly routed parent/child Issue instead of changing that repository from
  this worktree.
- The source commit, file list, license, data ownership, or cleanup requirement
  for code, data, schemas, or documentation is unclear.
- Work would access, commit, or expose a key, token, cookie, private key,
  controlled endpoint, real enterprise data, identifiable enterprise
  relationship, or secret local path.
- The Issue, local repository facts, and authoritative architecture conflict in
  a way that the stricter rule cannot resolve, or acceptance requires missing
  human authorization.

## Default Write Scope

- `docs/`
- `schemas/`
- `examples/`
- `scripts/`
- `bindings/`
- `test/`

## Local build, test, and validation

- Runtime prerequisite: Node.js 20 or newer.
- Install/setup: `npm ci`.
- Format/lint: currently not defined.
- Unit tests: `npm test`.
- Schema and example validation: `npm run validate:examples`.
- Compatibility validation: set `TIDAS_ROOT` and `PACT_ROOT` to checkouts at
  the exact revisions recorded in `docs/compatibility-baseline.json`, then run
  `npm run validate:compatibility`.
- Full validation: with those two environment variables set, run
  `npm run validate`. The CI workflow performs the equivalent pinned upstream
  checkouts before running this command.
- Build/package: currently not defined.
- Repository-specific secret scanner: currently not defined.

For a documentation-only task, at minimum run `git diff --check`, inspect the
diff for only the authorized paths, and use `git status --short` to confirm the
change scope. Run validation in proportion to the risk. Tests must not depend
on real enterprise data or long-lived repository credentials; controlled
external checks require explicit Issue authorization and only sanitized
evidence may be committed.

## Task boundaries

- One implementation Issue corresponds to one repository, task, worktree,
  branch, and PR.
- A cross-repository parent Issue coordinates scope, dependencies, and
  acceptance; it does not replace implementation Issues in owning
  repositories.
- A PR must use the complete `owner/repository#number` closing reference for
  its implementation Issue and must not be added to the TianGong SSCM Project
  as a separate Item.
- Migration or adoption work must record its exact source commit and file list
  in the specific Issue; do not turn a task-specific source list into an
  unverified permanent repository fact.
