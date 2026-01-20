/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-console */

import { createIDMUser, deleteIDMUser } from '@e2e/api/managedApi.e2e';

/**
 * Lighthouse CI Audit - Authenticated Enduser Pages
 *
 * Invoked by run-tests.sh during CI pipeline. Audits /enduser profile page
 * with OAuth-first authentication (IndexedDB tokens + explicit realm parameter).
 * Located in e2e/lighthouse-ci/ to prevent auto-discovery by regular E2E runs.
 */

describe('Lighthouse CI - Authenticated Enduser Pages', () => {
  const { baseUrl } = Cypress.config();

  // Test user - matches working E2E test pattern (created in test)
  let userId = '';
  let userName = '';

  describe('/enduser/profile', () => {
    // Determine realm for locationUrl (must include realm parameter to prevent mismatch)
    const isFraas = Cypress.env('IS_FRAAS');
    const realm = isFraas ? '/alpha' : '/';
    const locationUrl = `${baseUrl}/enduser/?realm=${encodeURIComponent(realm)}#/profile`;
    const auditResults = {};

    before(() => {
      console.log(`[Lighthouse] Starting audit: ${baseUrl}/enduser#/profile (realm: ${realm})`);
    });

    after(() => {
      // Clean up test user after all tests complete
      if (userId) {
        deleteIDMUser(userId);
      }
      cy.logout();
    });

    it('should audit enduser profile page with Lighthouse', () => {
      const testStartTime = Date.now();
      console.log('[Lighthouse] Authenticating as enduser...');
      Cypress.env('LIGHTHOUSE_ENABLED', 'true');

      // Create test user - matches working E2E pattern from dashboard.test.e2e.cy.js
      cy.loginAsAdminCached().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userId = responseUserId;
          userName = responseUserName;
          console.log(`[Lighthouse] Test user created: ${userName}`);
          cy.logout();

          // Build login URL with explicit realm (prevents realm mismatch - see technical guide)
          const enduserUrl = `${baseUrl}/enduser/?realm=${encodeURIComponent(realm)}`;
          const loginUrl = `${baseUrl}/am/XUI/?realm=${encodeURIComponent(realm)}&authIndexType=service&authIndexValue=Login&goto=${encodeURIComponent(enduserUrl)}#/`;

          cy.loginAsEnduser(userName, 'Rg_GRg9k&e', true, loginUrl);

          // Verify authentication succeeded
          console.log('[Lighthouse] Validating authentication...');
          cy.url({ timeout: 10000 }).should('include', '/enduser').should('not.include', '/am/XUI');

          cy.getCookies().then((cookies) => {
            console.log(`[Lighthouse] Cookies captured: ${cookies.length} (${cookies.map((c) => c.name).join(', ')})`);
            if (cookies.length === 0) {
              throw new Error('[Lighthouse] Authentication failed: zero cookies');
            }
            const hasSession = cookies.some((c) => c.name === 'iPlanetDirectoryPro' || c.name === 'amlbcookie');
            if (!hasSession) {
              throw new Error(`[Lighthouse] Authentication failed: no session cookies found. Got: ${cookies.map((c) => c.name).join(', ')}`);
            }
            console.log('[Lighthouse] Authentication completed');
          });

          // Wait for page stability
          console.log('[Lighthouse] Waiting for page to stabilize...');
          cy.get('body', { timeout: 20000 }).should('be.visible');
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(3000);

          cy.then(() => {
            const testDuration = Date.now() - testStartTime;
            console.log(`[Lighthouse] Setup completed in ${testDuration}ms`);
          });

          // Run Lighthouse audit
          console.log('[Lighthouse] Running Lighthouse audit via CDP...');
          const outputPath = '/workspace/.lighthouseci/lhr-enduser.json';

          cy.task('lighthouseAudit', {
            url: locationUrl,
            outputPath,
          }).then((results) => {
            if (!results || typeof results !== 'object') {
              throw new Error(`Lighthouse task failed: returned ${typeof results}`);
            }
            Object.assign(auditResults, results);
            console.log(`[Lighthouse] Audit complete - Performance: ${results.performance}, Accessibility: ${results.accessibility}, Best-Practices: ${results['best-practices']}, SEO: ${results.seo}`);
          });
        });
      });
    });

    // Optional: Add informational assertions (won't fail build)
    it('should have captured performance metrics', () => {
      cy.wrap(auditResults.performance).should('be.gte', 0);
    });

    it('should have captured accessibility metrics', () => {
      cy.wrap(auditResults.accessibility).should('be.gte', 0);
    });

    it('should have captured best-practices metrics', () => {
      cy.wrap(auditResults['best-practices']).should('be.gte', 0);
    });
  });
});
