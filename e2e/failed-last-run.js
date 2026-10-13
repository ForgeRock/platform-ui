#!/usr/bin/env node
/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Lists e2e tests that RAN and FAILED in the last cypress run for the current
 * package, with their error messages — the input for the "debug all the
 * failures - confirm if those are real failures or flaky tests" step of the RC
 * test tickets (e.g. IAM-12045, IAM-12106).
 *
 * Sources:
 * - mochawesome-report/*.json (reporterOptions has overwrite:false and json:true,
 *   so every spec run appends one numbered report; the aggregate mochawesome.json
 *   is ignored). Test objects carry no spec path — the top-level result.file does.
 * - e2e/<browser>/videos/ (e2e/plugins/index.js redirects artifacts to
 *   e2e/${BROWSER_NAME || 'local'}/videos) as the run boundary: the number of
 *   videos in the folder equals the number of specs in the last run.
 *
 * "The last run" = the newest K reports, where K = number of videos. This stays
 * correct across --spec re-runs (which join the same videos folder and append
 * their own reports) provided e2e/<browser>/videos/ is cleared before each
 * start of a run — same precondition as e2e/not-run-last-run.js. Mtime windows
 * were deliberately avoided: the report is written fractions of a second before
 * the video finalizes, so an mtime race mis-scopes runs.
 *
 * Unlike not-run-last-run.js this script reports TEST-level failures, not specs:
 * a spec with one failing test among passing ones lists only that test. "after
 * all" hook failures appear with their hook title so they are not lost.
 *
 * Usage — from a package directory, or from the repo root with --package <name>:
 *   node e2e/failed-last-run.js
 *   node e2e/failed-last-run.js --package platform-login
 *   --json : machine-readable output (one object per failed test)
 *   --specs : also dedupe to spec paths and print a --spec value for re-runs
 *   --specs --quiet : print ONLY the comma-separated spec list (no --spec prefix),
 *     for piping into commands, e.g.
 *     `node e2e/failed-last-run.js --specs --quiet | xargs -I{} cypress run --spec {}`
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
        error: (test.err && (test.err.message || test.err.toString())) || 'no error message',
      });
    }
  }
  for (const nested of suite.suites || []) collectTests(nested, specPath, out);
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

  // Newest K numbered reports, ignoring the aggregate mochawesome.json.
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
  for (const report of reports) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const parsed = require(path.resolve(report.path));
    for (const result of parsed.results || []) {
      // Test objects carry no file path; the top-level result does.
      const specPath = result.file || result.fullFile || '';
      collectTests(result, specPath, failed);
    }
  }

  const pkgName = path.basename(pkgDir);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(failed, null, 2));
    return;
  }

  if (process.argv.includes('--specs') && process.argv.includes('--quiet')) {
    // Print only the deduped spec list — for piping into commands.
    console.log([...new Set(failed.map((f) => f.spec))].sort().join(','));
    return;
  }

  console.log(`Package:        ${pkgName}`);
  console.log(`Run scope:      newest ${reports.length} report(s) (video count: ${videoCount})`);
  if (reports.length) {
    console.log(`Run window:     ${reports[0].file} … ${reports[reports.length - 1].file}`);
  }
  console.log(`Failed tests:   ${failed.length}`);
  console.log('');

  for (const {
    spec,
    title,
    isHook,
    error,
  } of failed) {
    console.log(`${spec}${isHook ? ' (after all hook)' : ''}`);
    console.log(`  ${title}`);
    console.log(`  ${error.split('\n')[0]}`);
    console.log('');
  }

  if (process.argv.includes('--specs')) {
    const failedSpecs = [...new Set(failed.map((f) => f.spec))].sort();
    console.log(`Failed specs:   ${failedSpecs.length}`);
    console.log('');
    console.log('Re-run value:');
    console.log(`--spec "${failedSpecs.join(',')}"`);
  }
}

main();
