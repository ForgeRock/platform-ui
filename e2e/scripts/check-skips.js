#!/usr/bin/env node
/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Skip-hygiene lint for e2e specs.
 *
 * Scans every e2e spec (Cypress `*.cy.js` / `*.e2e.js` and Cucumber `*.feature`
 * files) for quarantined tests — `it.skip`, `describe.skip`, `context.skip`,
 * `xit`, `xdescribe`, `xcontext` and Cucumber `@skip` tags — and enforces two
 * rules so that "skipped and forgotten" tests cannot accumulate silently:
 *
 *   1. Every skip must reference a Jira ticket (e.g. IAM-1234) in the test
 *      title or in a comment within a few lines of the skip. A skip with no
 *      Jira reference is a violation.
 *   2. When Jira credentials are available (JIRA_BASE_URL, JIRA_EMAIL and
 *      JIRA_TOKEN or JIRA_API_TOKEN environment variables), each referenced
 *      ticket is looked up: if every ticket referenced by a skip is already
 *      Closed/Done, the test has been fixed but left skipped — a violation.
 *
 * Exits non-zero when violations are found and prints a table of all skips.
 * Not wired into CI yet: 16 pre-existing master skip sites have no Jira
 * reference (tracked in IAM-12064); run locally or adopt as gating after
 * those are annotated.
 *
 * Usage:
 *   node e2e/scripts/check-skips.js            # or: yarn e2e:check-skips
 *
 * No dependencies beyond Node built-ins (requires Node >= 18 for fetch).
 */

// CLI tool — console output is its interface
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Directories that contain e2e specs (top-level e2e/ holds shared helpers but
// is scanned too, so skips can never hide in shared step definitions).
const SCAN_ROOTS = [
  path.join(REPO_ROOT, 'e2e'),
  ...fs.readdirSync(path.join(REPO_ROOT, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(REPO_ROOT, 'packages', entry.name, 'e2e'))
    .filter((dir) => fs.existsSync(dir)),
];

const SPEC_FILE_RE = /\.(cy\.js|e2e\.js|feature)$/;
const IGNORED_DIRS = new Set(['node_modules', 'fixtures', 'downloads', 'screenshots', 'videos']);

// JS skip forms. The leading guard prevents matching e.g. `foo.it.skip` chains
// or identifiers ending in xit ("exit(").
const JS_SKIP_RE = /(?:^|[^.\w])((?:it|describe|context)\.skip|x(?:it|describe|context))\s*\(/;
// Cucumber tag line form: `@skip` optionally alongside other tags.
const FEATURE_SKIP_RE = /(?:^|\s)@skip\b/;

// Jira issue keys, e.g. IAM-1234, IGA-56, FRAAS-789. `TC-` (BrowserStack test
// case ids) and `C-`-style ids do not match the two-letter minimum prefix or
// are explicitly excluded below.
const JIRA_KEY_RE = /\b([A-Z][A-Z0-9]+)-(\d+)\b/g;
const NON_JIRA_PREFIXES = new Set(['TC', 'UTF', 'ISO', 'SHA', 'RFC', 'CVE']);
// Keys from other Jira instances (e.g. OPENAM on the former ForgeRock Jira)
// count as ticket references but cannot be looked up on the Ping Jira.
const NON_LOOKUPABLE_PREFIXES = new Set(['OPENAM']);

// How many lines of context around a skip are searched for a Jira reference.
const CONTEXT_LINES_BEFORE = 6;
const CONTEXT_LINES_AFTER = 2;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) walk(path.join(dir, entry.name), files);
    } else if (SPEC_FILE_RE.test(entry.name)) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function extractJiraKeys(lines, index) {
  const start = Math.max(0, index - CONTEXT_LINES_BEFORE);
  const end = Math.min(lines.length, index + CONTEXT_LINES_AFTER + 1);
  const context = lines.slice(start, end).join('\n');
  const keys = new Set();
  for (const match of context.matchAll(JIRA_KEY_RE)) {
    if (!NON_JIRA_PREFIXES.has(match[1])) keys.add(`${match[1]}-${match[2]}`);
  }
  return [...keys];
}

function describeSkip(line, isFeature) {
  if (isFeature) return '@skip';
  const match = line.match(JS_SKIP_RE);
  return match ? match[1] : 'skip';
}

function extractTitle(lines, index, isFeature) {
  if (isFeature) {
    // The scenario/feature name usually follows the tag line.
    for (let i = index + 1; i < Math.min(lines.length, index + 3); i += 1) {
      const m = lines[i].match(/^\s*(?:Scenario(?: Outline)?|Feature):\s*(.+)$/);
      if (m) return m[1].trim();
    }
    return '';
  }
  const joined = lines.slice(index, Math.min(lines.length, index + 2)).join(' ');
  const m = joined.match(/\(\s*['"`](.*?)['"`]/);
  return m ? m[1] : '';
}

function findSkips() {
  const skips = [];
  for (const root of SCAN_ROOTS) {
    for (const file of walk(root)) {
      const isFeature = file.endsWith('.feature');
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        // Ignore fully commented-out JS lines — a commented skip is not active.
        if (!isFeature && /^\s*(\/\/|\*)/.test(line)) return;
        if (isFeature && /^\s*#/.test(line)) return;
        const matched = isFeature ? FEATURE_SKIP_RE.test(line) : JS_SKIP_RE.test(line);
        if (!matched) return;
        skips.push({
          file: path.relative(REPO_ROOT, file),
          line: index + 1,
          form: describeSkip(line, isFeature),
          title: extractTitle(lines, index, isFeature),
          jiraKeys: extractJiraKeys(lines, index),
        });
      });
    }
  }
  return skips;
}

function jiraCredentials() {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_TOKEN || process.env.JIRA_API_TOKEN;
  if (!baseUrl || !email || !token) return null;
  return { baseUrl: baseUrl.replace(/\/$/, ''), email, token };
}

async function fetchJiraStatus(key, creds, cache) {
  if (cache.has(key)) return cache.get(key);
  let result;
  try {
    const response = await fetch(`${creds.baseUrl}/rest/api/2/issue/${key}?fields=status,resolution`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.email}:${creds.token}`).toString('base64')}`,
        Accept: 'application/json',
      },
    });
    if (response.status === 404) {
      result = { status: 'NOT FOUND', done: false, error: true };
    } else if (!response.ok) {
      result = { status: `HTTP ${response.status}`, done: false, error: true };
    } else {
      const body = await response.json();
      const status = body.fields?.status?.name || 'UNKNOWN';
      const category = body.fields?.status?.statusCategory?.key;
      result = { status, done: category === 'done', error: false };
    }
  } catch (error) {
    result = { status: `ERROR (${error.message})`, done: false, error: true };
  }
  cache.set(key, result);
  return result;
}

function renderTable(rows, headers) {
  const widths = headers.map((header, i) => Math.max(header.length, ...rows.map((row) => String(row[i]).length)));
  const renderRow = (row) => row.map((cell, i) => String(cell).padEnd(widths[i])).join('  ');
  const separator = widths.map((width) => '-'.repeat(width)).join('  ');
  return [renderRow(headers), separator, ...rows.map(renderRow)].join('\n');
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

async function main() {
  const skips = findSkips();
  const creds = jiraCredentials();
  const statusCache = new Map();

  if (creds) {
    console.log(`Jira credentials found — verifying referenced tickets against ${creds.baseUrl}\n`);
  } else {
    console.log('No Jira credentials (JIRA_BASE_URL / JIRA_EMAIL / JIRA_TOKEN) — skipping closed-ticket detection\n');
  }

  // Prefetch the status of every referenced ticket in one parallel batch.
  if (creds) {
    const allKeys = [...new Set(skips.flatMap((skip) => skip.jiraKeys))];
    await Promise.all(allKeys.map((key) => fetchJiraStatus(key, creds, statusCache)));
  }

  const rows = [];
  const violations = [];

  for (const skip of skips) {
    const location = `${skip.file}:${skip.line}`;
    let jiraColumn = skip.jiraKeys.join(', ') || '(none)';
    let verdict = 'OK';

    if (skip.jiraKeys.length === 0) {
      verdict = 'FAIL: no Jira reference';
      violations.push(`${location} [${skip.form}] has no Jira reference — add a comment linking the tracking ticket`);
    } else if (creds) {
      // Keys from other Jira instances can't be verified here — treat them as
      // satisfied references rather than lookup failures.
      const lookupable = skip.jiraKeys.filter((key) => !NON_LOOKUPABLE_PREFIXES.has(key.split('-')[0]));
      const statuses = lookupable.map((key) => statusCache.get(key));
      const nonLookupable = skip.jiraKeys.length - lookupable.length;
      jiraColumn = [
        ...lookupable.map((key, i) => `${key} (${statuses[i].status})`),
        ...skip.jiraKeys.filter((key) => NON_LOOKUPABLE_PREFIXES.has(key.split('-')[0])),
      ].join(', ');
      const lookupFailed = statuses.some((s) => s.error);
      const anyOpen = statuses.some((s) => !s.done && !s.error);
      if (lookupable.length === 0 && nonLookupable > 0) {
        verdict = 'OK (external Jira)';
      } else if (!anyOpen && !lookupFailed && nonLookupable === 0) {
        verdict = 'FAIL: fixed but still skipped';
        violations.push(`${location} [${skip.form}] references only closed tickets (${jiraColumn}) — the fix landed but the skip was left behind`);
      } else if (lookupFailed && !anyOpen) {
        verdict = 'WARN: Jira lookup failed';
      }
    }

    rows.push([location, skip.form, truncate(skip.title, 60), jiraColumn, verdict]);
  }

  if (rows.length === 0) {
    console.log('No skipped e2e tests found.');
    return;
  }

  console.log(renderTable(rows, ['Location', 'Form', 'Test', 'Jira', 'Verdict']));
  console.log(`\n${rows.length} skip site(s) found, ${violations.length} violation(s).`);

  if (violations.length > 0) {
    console.error('\nViolations:');
    for (const violation of violations) console.error(`  - ${violation}`);
    console.error('\nEvery skipped test must reference an OPEN Jira ticket near the skip.');
    console.error('If the ticket is closed, either re-enable the test or reference the follow-up ticket.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`check-skips failed: ${error.stack}`);
  process.exitCode = 2;
});
