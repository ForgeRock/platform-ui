#!/usr/bin/env node
/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Case-ID lint for e2e specs (WP-27 foundation tooling, IAM-12064).
 *
 * Every automated e2e test must be traceable back to the manual test case it
 * automates. This lint enforces:
 *
 *   1. Every `it()` block in every Cypress spec must have a `[C#####]` (or
 *      `[TC-#####]`) case-ID prefix in its title, e.g.
 *      `it('[C24591] Admin can ...', ...)`.
 *   2. Every `Scenario:` / `Scenario Outline:` in every `.feature` file must
 *      carry a case ID either in the scenario name (the target convention per
 *      IAM-11130) or as a legacy `@C#####` / `@TC-#####` tag above it. During
 *      the IAM-11130 transition both forms are accepted; once the rename
 *      lands the tag form can be dropped.
 *   3. A test title must carry exactly one case ID — multiple IDs in one
 *      title is a violation.
 *   4. (Warning only) The same case ID must not appear in more than one test
 *      across the whole repo — duplicates usually mean a test case was
 *      automated twice. Per-environment variants (same title and case ID
 *      within one file, differing only in tags) are allowed.
 *
 * Data-driven tests declared with `eachCase()` (e2e/util.js) are checked too:
 * each item's `name:` title generates an `it()` call and is held to the same
 * rules. Commented-out code is ignored.
 *
 * Tests that are not catalog cases (performance audits, standalone-IDM
 * coverage/smoke tooling) are exempted by spec path via ALLOWLIST_PATHS below.
 * Every allowlist entry must state why it exists.
 *
 * Prints a report; violations do not fail the run by default (the known
 * pre-existing master violations still need their case IDs). Set
 * CHECK_CASE_IDS_STRICT=1 to make violations blocking.
 *
 * Usage:
 *   node e2e/scripts/check-case-ids.js            # or: yarn e2e:check-case-ids
 *
 * No dependencies beyond Node built-ins.
 */

// CLI tool — console output is its interface
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Directories that contain e2e specs (top-level e2e/ holds shared helpers but
// is scanned too, in case specs ever land there).
const SCAN_ROOTS = [
  path.join(REPO_ROOT, 'e2e'),
  ...fs.readdirSync(path.join(REPO_ROOT, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(REPO_ROOT, 'packages', entry.name, 'e2e'))
    .filter((dir) => fs.existsSync(dir)),
];

const JS_SPEC_FILE_RE = /\.(cy\.js|e2e\.js)$/;
const IGNORED_DIRS = new Set(['node_modules', 'fixtures', 'downloads', 'screenshots', 'videos', 'hars']);

// An `it(...)` call with a string-literal title. The leading guard prevents
// matching identifiers ending in "it" (e.g. `visit(`, `edit(`).
const IT_RE = /(?:^|[^.\w$])it(?:\.only|\.skip)?\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;

// A `Scenario:` / `Scenario Outline:` line in a Gherkin file.
const SCENARIO_RE = /^\s*(?:Scenario|Scenario Outline):\s*(.+)$/;

// BrowserStack manual case identifiers come in two forms: `C#####` and `TC-#####`.
// Titles must start with the source case's identifier in either form, and must
// not carry more than one.
const CASE_ID_TITLE_RE = /^\[(?:C|TC-)\d+\]/;
const CASE_ID_ANYWHERE_RE = /\[(C\d+|TC-\d+)\]/g;

// `name:` property inside an eachCase([...]) data array — generates an it()
// title, so it must satisfy the same rules as a string-literal it() title.
const EACH_CASE_CALL_RE = /(?:^|[^.\w$])eachCase\s*\(\s*\[/g;
const DATA_ITEM_NAME_RE = /(?:^|[{,]\s*)name:\s*(['"`])((?:\\.|(?!\1).)*)\1/g;

// End index of the eachCase data array starting at `openIndex` (the `[`),
// by bracket matching. Returns -1 when the array is unbalanced (malformed).
function eachCaseArrayEnd(content, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < content.length; i += 1) {
    if (content[i] === '[') depth += 1;
    else if (content[i] === ']') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// Legacy tag form used before IAM-11130: `@C#####` / `@TC-#####` in the tag
// lines directly above a scenario.
const CASE_ID_TAG_RE = /@(C\d+|TC-\d+)/;

// Tests that are not automations of a BrowserStack manual case, allowlisted
// by spec path. Each entry must carry a reason; an entry without a reason
// defeats the audit trail.
const ALLOWLIST_PATHS = [
  {
    reason: 'Lighthouse performance audit harnesses are CI tooling, not manual-case automations',
    patterns: ['lighthouse.suite.cy.js', 'lighthouse-ci/'],
  },
  {
    reason: 'IDM standalone deployment smoke/coverage baselines have no manual catalog equivalent (IAM-11889)',
    patterns: ['idm-tests/'],
  },
];

function isAllowlisted(relativePath) {
  return ALLOWLIST_PATHS.some((entry) => entry.patterns.some((pattern) => relativePath.includes(pattern)));
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) walk(path.join(dir, entry.name), files);
    } else if (JS_SPEC_FILE_RE.test(entry.name) || entry.name.endsWith('.feature')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function lineOfIndex(content, index) {
  return content.slice(0, index).split('\n').length;
}

// Collect the tag lines immediately above a Gherkin scenario (commented tag
// lines are skipped — a commented-out tag does not apply).
function precedingTags(lines, index) {
  const tags = [];
  for (let i = index - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (line === '') break;
    if (!line.startsWith('@')) break;
    tags.push(line);
  }
  return tags.join(' ');
}

function main() {
  const specFiles = SCAN_ROOTS.flatMap((root) => walk(root));

  const violations = [];
  // case-ID -> [{ file, line, title }]
  const caseIdSites = new Map();
  let itCount = 0;
  let scenarioCount = 0;
  let allowlistedCount = 0;

  // Shared checks for one generated or literal test title. Mirrors the it()
  // path: no-case-ID and multiple-case-ID violations, plus duplicate-ID
  // registration.
  const checkTitle = (relative, line, title, label) => {
    const ids = [...title.matchAll(CASE_ID_ANYWHERE_RE)].map((m) => m[1]);

    for (const caseId of ids) {
      if (!caseIdSites.has(caseId)) caseIdSites.set(caseId, []);
      caseIdSites.get(caseId).push({ file: relative, line, title });
    }

    if (!CASE_ID_TITLE_RE.test(title)) {
      violations.push(`${relative}:${line} ${label} "${title}" has no [C#####] case-ID prefix`);
    } else if (ids.length > 1) {
      violations.push(`${relative}:${line} ${label} "${title}" carries ${ids.length} case IDs — one per test`);
    }
  };

  for (const file of specFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relative = path.relative(REPO_ROOT, file);
    const isFeature = file.endsWith('.feature');

    // Whole-file allowlist: these specs are non-catalog tooling (perf audits,
    // standalone-IDM baselines), so none of their tests carry case IDs.
    if (isAllowlisted(relative)) {
      allowlistedCount += 1;
    } else if (isFeature) {
      const lines = content.split('\n');
      const scenarios = lines
        .map((line, index) => ({ line, index, match: line.match(SCENARIO_RE) }))
        .filter((entry) => entry.match);
      for (const scenario of scenarios) {
        const { index, match } = scenario;
        const title = match[1].trim();
        const tags = precedingTags(lines, index);
        scenarioCount += 1;

        for (const idMatch of title.matchAll(CASE_ID_ANYWHERE_RE)) {
          const caseId = idMatch[1];
          if (!caseIdSites.has(caseId)) caseIdSites.set(caseId, []);
          caseIdSites.get(caseId).push({ file: relative, line: index + 1, title });
        }

        if (!CASE_ID_TITLE_RE.test(title) && !CASE_ID_TAG_RE.test(tags)) {
          // Legacy @C##### tag form is accepted during the IAM-11130 transition.
          violations.push(`${relative}:${index + 1} scenario "${title}" has no case ID (add "[C#####] " to the name, or a legacy @C##### tag above it)`);
        }
      }
    } else {
      const lines = content.split('\n');

      // Data-driven titles: eachCase([...]) items' `name:` properties become
      // it() titles via e2e/util.js, so they are linted like literal it()s.
      const eachCaseCalls = [...content.matchAll(EACH_CASE_CALL_RE)]
        .map((call) => {
          const openIndex = content.indexOf('[', call.index);
          const arrayEnd = eachCaseArrayEnd(content, openIndex);
          return arrayEnd === -1 ? null : { call, arrayContent: content.slice(openIndex, arrayEnd + 1) };
        })
        .filter(Boolean);
      for (const { call, arrayContent } of eachCaseCalls) {
        for (const nameMatch of arrayContent.matchAll(DATA_ITEM_NAME_RE)) {
          const line = lineOfIndex(content, call.index + (call[0].length) + nameMatch.index);
          itCount += 1;
          checkTitle(relative, line, nameMatch[2], 'data-driven test');
        }
      }

      const activeItMatches = [...content.matchAll(IT_RE)].filter((match) => {
        // Skip commented-out lines — a commented it() is not an active test.
        // IT_RE consumes the preceding whitespace/newline, so attribute the
        // match to the line holding the `it(` keyword itself.
        const codeStart = match.index + match[0].length - match[0].trimStart().length;
        const line = lineOfIndex(content, codeStart);
        return !/^\s*(\/\/|\*)/.test(lines[line - 1]);
      });
      for (const match of activeItMatches) {
        const codeStart = match.index + match[0].length - match[0].trimStart().length;
        const [, , title] = match;
        itCount += 1;
        checkTitle(relative, lineOfIndex(content, codeStart), title, 'test');
      }
    }
  }

  // Same C-ID + same title within one file is the established pattern for
  // per-environment variants of one manual case (e.g. a @cloud and a
  // @forgeops it() covering the same manual case) — not a duplicate.
  const duplicates = [...caseIdSites.entries()].filter(([, sites]) => {
    if (sites.length < 2) return false;
    const first = sites[0];
    return !sites.every((site) => site.file === first.file && site.title === first.title);
  });

  console.log(`Scanned ${specFiles.length} spec file(s) (${allowlistedCount} allowlisted): ${itCount} it() block(s), ${scenarioCount} scenario(s); ${caseIdSites.size} distinct case-ID(s).`);

  if (duplicates.length > 0) {
    console.warn(`\nWARNING: ${duplicates.length} case-ID(s) used by more than one test:`);
    for (const [caseId, sites] of duplicates) {
      console.warn(`  [${caseId}]`);
      for (const site of sites) console.warn(`    - ${site.file}:${site.line} "${site.title}"`);
    }
  }

  if (violations.length > 0) {
    const strict = process.env.CHECK_CASE_IDS_STRICT === '1';
    console.error(`\n${violations.length} violation(s):`);
    for (const violation of violations) console.error(`  - ${violation}`);
    console.error('\nEvery test title must start with its BrowserStack manual test case ID, e.g.');
    console.error("  it('[C12345] Admin can save a policy', () => { ... });");
    console.error('  Scenario: [C20750] Make 6 failed logins in a row - user is locked');
    console.error('Tests that are not manual-case automations may be allowlisted in e2e/scripts/check-case-ids.js with a reason.');
    if (strict) {
      console.error('\nCHECK_CASE_IDS_STRICT=1 — failing the run.');
      process.exitCode = 1;
    } else {
      console.error('\nNot failing the run: pre-existing violations are tracked in IAM-12064. Set CHECK_CASE_IDS_STRICT=1 to make violations blocking.');
    }
    return;
  }

  console.log('check-case-ids passed.');
}

try {
  main();
} catch (error) {
  console.error(`check-case-ids failed: ${error.stack}`);
  process.exitCode = 2;
}
