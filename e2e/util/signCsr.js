/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Node-side helper for signing a CSR with a test CA using OpenSSL.
 *
 * The test CA files (ca.cert.pem / ca.key.pem) are committed under
 * packages/platform-admin/e2e/fixtures/ssl/. They are intentionally
 * a non-production self-signed CA used only for E2E automation — committing
 * a test-only private key is acceptable here.
 *
 * Signing uses `openssl x509 -req` which produces PEM-only output with no
 * human-readable text, satisfying the app's strict PEM upload requirement.
 */

import { execSync } from 'child_process';
import {
  mkdtempSync, writeFileSync, readFileSync, rmSync,
} from 'fs';
import { tmpdir } from 'os';
import { resolve, join } from 'path';

const SSL_FIXTURES_DIR = resolve(
  __dirname,
  '../../packages/platform-admin/e2e/fixtures/ssl',
);
const CA_CERT = join(SSL_FIXTURES_DIR, 'ca.cert.pem');
const CA_KEY = join(SSL_FIXTURES_DIR, 'ca.key.pem');

/**
 * Signs a CSR PEM string and returns the chain PEM content.
 *
 * @param {object} options
 * @param {string} options.csrPem - PEM-encoded certificate signing request
 * @returns {{ chainPemContent: string }} chain PEM containing signed cert + CA cert
 */
function signCsr({ csrPem }) {
  if (!csrPem || !csrPem.includes('BEGIN CERTIFICATE REQUEST')) {
    throw new Error(`signCsr: invalid csrPem — expected a PEM CSR, got: ${String(csrPem).substring(0, 80)}`);
  }

  // Unique temp directory per invocation to avoid collisions between parallel runs
  const tmpDir = mkdtempSync(join(tmpdir(), 'fr-ssl-sign-'));

  const csrPath = join(tmpDir, 'csr.pem');
  const signedPath = join(tmpDir, 'signed.pem');

  writeFileSync(csrPath, csrPem);

  // Sign the CSR. `openssl x509 -req` outputs ONLY the PEM certificate block —
  // no human-readable text that would cause the app to reject the upload.
  execSync(
    `openssl x509 -req -in "${csrPath}" -CA "${CA_CERT}" -CAkey "${CA_KEY}" \
     -CAcreateserial -out "${signedPath}" -days 365 -sha256`,
    { stdio: 'pipe' }, // suppress openssl's stderr progress output
  );

  const signedPem = readFileSync(signedPath, 'utf8').trim();
  const caCertPem = readFileSync(CA_CERT, 'utf8').trim();

  // Build the chain: signed leaf cert followed by the CA cert.
  // Must contain ONLY PEM blocks — no `openssl x509 -text` output.
  const chainPemContent = `${signedPem}\n${caCertPem}\n`;

  // Defensive validation: ensure we produced valid PEM output
  if (!chainPemContent.startsWith('-----BEGIN CERTIFICATE-----')) {
    throw new Error(`signCsr: chain.pem does not start with a PEM certificate block.\nGot: ${chainPemContent.substring(0, 120)}`);
  }

  // Clean up temp files (csr, signed); the caller receives the content directly
  try { rmSync(tmpDir, { recursive: true }); } catch (_) { /* non-fatal */ }

  return { chainPemContent };
}

export default { signCsr };
