#!/usr/bin/env node
/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Builds a Cypress command that re-runs ONLY the tests that failed in the last
 * cypress run for the current package — test-level, not spec-level.
 *
 * Uses @cypress/grep (already registered in every package's support file) via
 * CYPRESS_grep: the env value is a ';'-separated list of title parts, each
 * substring-matched against the full test name ("suite names + test title"),
 * the same string mochawesome reports as fullTitle.
 *
 * What grep cannot target runs at spec level instead:
 * - .feature specs: cucumber scenarios are filtered via CYPRESS_TAGS, grep is
 *   deliberately not registered for them (see each package's support file)
 * - hook failures ("after all" hook): they belong to no it(); re-running the
 *   spec re-runs the hook
 *
 * Substring matching is fuzzy: a failed test whose title is contained in
 * another test's title drags that test along. The default output cross-checks
 * the grep against every title in the scoped reports and lists such tests as
 * "also runs".
 *
 * Sources and run scoping are the same as e2e/failed-last-run.js (video count
 * scopes the newest K mochawesome reports; clear e2e/<browser>/videos/ before
 * each run).
 *
 * Usage — from a package directory, or from the repo root with --package <name>:
 *   node e2e/failed-tests-last-run.js
 *   node e2e/failed-tests-last-run.js --package platform-admin
 *   --command : print ONLY the ready-to-run command line
 *   --json    : machine-readable output ({ grep, specs, specFallbacks, alsoRuns })
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function resolvePackageDir() {
  const index = process.argv.indexOf('--package');
  if (index !== -1 && process.argv[index + 1]) {
    return path.join(ROOT, 'packages', process.argv[index + 1]);
  }
  return process.cwd();
}

function collectTests(suite, specPath, out) {
  for (const test of suite.tests || []) {
    if (['failed', 'broken'].includes(test.state)) {
      out.push({
        spec: specPath,
        title: test.fullTitle || test.title,
        isHook: Boolean(test.isHook),
      });
    }
  }
  for (const nested of suite.suites || []) collectTests(nested, specPath, out);
}

function collectAllTitles(suite, out) {
  for (const test of suite.tests || []) {
    if (test.fullTitle) out.push(test.fullTitle);
  }
  for (const nested of suite.suites || []) collectAllTitles(nested, out);
}

function shellQuote(value) {
  return `"${String(value).replace(/([$`"\\])/g, '\\$1')}"`;
}

function main() {
  const pkgDir = resolvePackageDir();
  const browserName = process.env.BROWSER_NAME || 'local';
  const videosDir = path.join(pkgDir, 'e2e', browserName, 'videos');
  const reportDir = path.join(pkgDir, 'mochawesome-report');

  if (!fs.existsSync(videosDir)) {
    console.error(`No video artifacts found at ${path.relative(ROOT, videosDir)}/ — cannot derive the run size.`);
    console.error('Clear the videos folder before each run; the video count is what scopes "the last run".');
    process.exit(1);
  }

  const videoCount = fs.readdirSync(videosDir, { recursive: true })
    .filter((f) => f.endsWith('.mp4')).length;

  if (!fs.existsSync(reportDir)) {
    console.error(`No mochawesome reports found at ${path.relative(ROOT, reportDir)}/.`);
    process.exit(1);
  }

  const reports = fs.readdirSync(reportDir)
    .filter((f) => /^mochawesome_\d+\.json$/.test(f))
    .map((f) => {
      const filePath = path.join(reportDir, f);
      return { file: f, path: filePath, mtimeMs: fs.statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, videoCount)
    .sort((a, b) => a.mtimeMs - b.mtimeMs);

  const failed = [];
  // Every fullTitle in the scoped reports, per spec — the universe of titles
  // grep could over-match into (tests that did not fail but contain a failed
  // test's title as a substring).
  const spec = {};
  for (const report of reports) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const parsed = require(path.resolve(report.path));
    for (const result of parsed.results || []) {
      const specPath = result.file || result.fullFile || '';
      spec[specPath] = spec[specPath] || { failed: [], allTitles: [] };
      collectTests(result, specPath, spec[specPath].failed);
      collectAllTitles(result, spec[specPath].allTitles);
    }
  }
  Object.values(spec).forEach((s) => failed.push(...s.failed));

  const grepTitles = new Set();
  const specFallbacks = new Set();
  for (const f of failed) {
    if (f.isHook || f.spec.endsWith('.feature')) {
      specFallbacks.add(f.spec);
    } else {
      grepTitles.add(f.title);
    }
  }

  const grepValue = [...grepTitles].sort().join(';');
  const fallbackSpecs = [...specFallbacks].sort();
  const specList = [...new Set([...grepTitles.size ? Object.keys(spec) : [], ...fallbackSpecs])]
    .filter((s) => (grepTitles.size ? true : fallbackSpecs.includes(s)))
    .sort();

  // Cross-check: which non-failed titles in the scoped reports would grep drag along
  const alsoRuns = [];
  if (grepValue) {
    // @cypress/grep exports only '.' and './plugin'; reach the util by file path
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const { parseFullTitleGrep, shouldTestRunTitle } = require(path.join(ROOT, 'node_modules', '@cypress', 'grep', 'dist', 'utils.js'));
    const parsedGrep = parseFullTitleGrep(grepValue);
    const failedSet = new Set(failed.map((f) => f.title));
    for (const [specPath, s] of Object.entries(spec)) {
      for (const title of s.allTitles) {
        if (!failedSet.has(title) && shouldTestRunTitle(parsedGrep, title)) {
          alsoRuns.push({ spec: specPath, title });
        }
      }
    }
  }

  const commandParts = [];
  if (grepTitles.size) commandParts.push(`CYPRESS_grep=${shellQuote(grepValue)}`);
  if (specList.length) commandParts.push(`cypress run --browser ${browserName === 'local' ? 'chrome' : browserName} --spec ${shellQuote(specList.join(','))}`);
  const command = commandParts.join(' ');

  if (process.argv.includes('--command')) {
    console.log(command || '# nothing failed in the last run');
    return;
  }

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({
      grep: grepValue || null, specs: specList, specFallbacks: fallbackSpecs, alsoRuns,
    }, null, 2));
    return;
  }

  const pkgName = path.basename(pkgDir);
  console.log(`Package:        ${pkgName}`);
  console.log(`Run scope:      newest ${reports.length} report(s) (video count: ${videoCount})`);
  console.log(`Failed tests:   ${failed.length}`);
  console.log(`Grep-targeted:  ${grepTitles.size} test title(s) in ${grepTitles.size ? [...new Set(failed.filter((f) => !f.isHook && !f.spec.endsWith('.feature')).map((f) => f.spec))].length : 0} .cy.js spec(s)`);
  console.log(`Spec fallback:  ${fallbackSpecs.length} spec(s) (.feature scenarios or hook failures)`);
  console.log('');

  for (const [specPath, s] of Object.entries(spec)) {
    if (!s.failed.length) continue; // eslint-disable-line no-continue
    console.log(specPath);
    for (const f of s.failed) {
      console.log(`  ${f.isHook ? '[hook] ' : ''}${f.title}`);
    }
    console.log('');
  }

  if (alsoRuns.length) {
    console.log('Would ALSO run (title is a substring of these passing tests):');
    for (const a of alsoRuns) {
      console.log(`  ${a.spec}`);
      console.log(`    ${a.title}`);
    }
    console.log('');
  }

  console.log('Re-run command:');
  console.log(`  ${command || '# nothing failed in the last run'}`);
}

main();
