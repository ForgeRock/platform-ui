#!/usr/bin/env node
/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Lists e2e specs that were NOT run in the last cypress run for the current package.
 *
 * A spec is considered "run" when it produced a video artifact under
 * e2e/<browser>/videos/ — e2e/plugins/index.js redirects screenshotsFolder and
 * videosFolder to `e2e/${BROWSER_NAME || 'local'}/videos`, so plain `cypress run`
 * writes to e2e/local/videos. Cypress finalizes a spec's video when the spec
 * finishes (pass or fail), so "video exists" == "spec ran to completion".
 *
 * Spec eligibility is read from the package's cypress.config.js (specPattern and
 * excludeSpecPattern), so the script follows each package's actual config:
 *   platform-login / platform-enduser : e2e/tests/ (js and feature files)
 *   platform-admin                    : additionally e2e/features/ and e2e/idm-tests/
 * Bare-filename excludeSpecPattern entries (e.g. 'lighthouse.suite.cy.js') do not
 * match in practice — evidence: platform-login runs record a lighthouse.suite.cy.js
 * video — so only path-like excludes (containing '/') are applied.
 *
 * Clear e2e/<browser>/videos/ before each full run; otherwise artifacts from earlier
 * runs count as "ran" (the script cannot tell which run a video came from).
 *
 * Usage — from a package directory (packages/platform-login, platform-enduser,
 * platform-admin), or from the repo root with --package <name>:
 *   node e2e/not-run-last-run.js
 *   node ../../e2e/not-run-last-run.js            # from a package dir
 *   node e2e/not-run-last-run.js --package platform-enduser
 *   --spec     : also print a ready-to-paste --spec value with the not-run list
 *   --spec-only : print ONLY the raw comma-separated list, for piping into
 *     commands, e.g. `node ../../e2e/not-run-last-run.js --spec-only | xargs -I{} cypress run --spec {}`
 *   --prepend <spec> : merge a spec in front of the not-run list (deduped)
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

function expandPattern(pattern, baseDir) {
  // Supports: e2e/dir/**/*.{js,feature} | e2e/dir/**/*.cy.js | e2e/dir/**/*.js
  const [dirPart, tailPart] = pattern.split('/**/*');
  if (!tailPart) {
    console.error(`Unsupported specPattern entry: ${pattern}`);
    return [];
  }
  let endings;
  if (tailPart.startsWith('.{')) {
    endings = tailPart.slice(2, -1).split(',').map((ext) => `.${ext}`);
  } else {
    endings = [tailPart];
  }
  const base = path.join(baseDir, dirPart);
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (endings.some((ending) => entry.name.endsWith(ending))) out.push(p);
    }
  }
  walk(base);
  return out.sort();
}

function pathLikeExcludeDirs(excludeSpecPattern) {
  return excludeSpecPattern
    .filter((entry) => entry.includes('/'))
    .map((entry) => entry.replace(/\*\*.*$/, ''));
}

function main() {
  const pkgDir = resolvePackageDir();
  const configPath = path.join(pkgDir, 'cypress.config.js');
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const config = require(path.resolve(configPath));
  const e2eConfig = config.e2e || {};

  const patterns = [].concat(e2eConfig.specPattern || ['e2e/tests/**/*.{js,feature}']);
  const excludeDirs = pathLikeExcludeDirs(
    [].concat(e2eConfig.excludeSpecPattern || []),
  );

  const allSpecs = patterns
    .flatMap((pattern) => expandPattern(pattern, pkgDir))
    .map((p) => path.relative(pkgDir, p))
    .filter((p) => !excludeDirs.some((d) => p.startsWith(d)))
    .sort();

  const browserName = process.env.BROWSER_NAME || 'local';
  const videosDir = path.join(pkgDir, 'e2e', browserName, 'videos');

  // Artifact paths drop the top two segments of the spec path (e2e/tests/ and,
  // for multi-pattern configs, e2e/features/ and e2e/idm-tests/). Match a ran
  // spec against several candidate keys so all layouts are covered.
  let videoFiles = [];
  if (fs.existsSync(videosDir)) {
    videoFiles = fs.readdirSync(videosDir, { recursive: true });
  }
  const ranSpecs = new Set(
    videoFiles
      .filter((f) => f.endsWith('.mp4'))
      .map((f) => f.slice(0, -4)),
  );
  const ran = (spec) => ranSpecs.has(spec)
    || ranSpecs.has(spec.replace(/^e2e\//, ''))
    || ranSpecs.has(spec.replace(/^e2e\/[^/]+\//, ''));

  const notRun = allSpecs.filter((spec) => !ran(spec));
  const run = allSpecs.filter((spec) => ran(spec));

  const pkgName = path.basename(pkgDir);

  if (process.argv.includes('--spec-only')) {
    // Print only the raw comma-separated list — for piping into commands.
    console.log(notRun.join(','));
    return;
  }

  console.log(`Package:        ${pkgName}`);
  console.log(`Artifacts dir:  ${path.relative(ROOT, videosDir)}/`);
  console.log(`Eligible specs: ${allSpecs.length}`);
  console.log(`Ran:            ${run.length}`);
  console.log(`NOT run:        ${notRun.length}`);
  console.log('');
  notRun.forEach((spec) => console.log(`  ${spec}`));

  if (process.argv.includes('--spec')) {
    console.log('');
    console.log('Re-run value:');
    console.log(`--spec "${notRun.join(',')}"`);
  }

  if (process.argv.includes('--prepend')) {
    const prepend = process.argv[process.argv.indexOf('--prepend') + 1];
    const merged = [prepend, ...notRun.filter((spec) => spec !== prepend)];
    console.log('');
    console.log('Merged value:');
    console.log(`--spec "${merged.join(',')}"`);
  }
}

main();
