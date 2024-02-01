/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'cypress-lighthouse';

describe.skip('platform-enduser lighthouse suite', () => { // eslint-disable-line mocha/no-exclusive-tests
  const passThreshold = Cypress.env('lighthousePassThreshold');
  const adminUserName = Cypress.env('AM_USERNAME'); // eslint-disable-line no-unused-vars
  const adminPassword = Cypress.env('AM_PASSWORD'); // eslint-disable-line no-unused-vars
  const retries = 0;

  describe('/enduser/profile', { retries }, () => {
    const locationUrl = `${Cypress.config().baseUrl}/enduser#/profile`;
    const auditResults = {};

    before(() => {
      cy.loginAsAdmin();
      cy.lighthouse(locationUrl).then((results) => {
        Object.assign(auditResults, results);
      });
    });

    it('should exceed performance threshold', () => {
      cy.wrap(auditResults.performance).should('be.gte', passThreshold.performance);
    });

    it('should exceed accessibility threshold', () => {
      cy.wrap(auditResults.accessibility).should('be.gte', passThreshold.accessibility);
    });

    it('should exceed best-practices threshold', () => {
      cy.wrap(auditResults['best-practices']).should('be.gte', passThreshold['best-practices']);
    });
  });

  describe('/enduser/dashboard', { retries }, () => {
    const locationUrl = `${Cypress.config().baseUrl}/enduser#/dashboard`;
    const auditResults = {};

    before(() => {
      cy.loginAsAdmin();
      cy.lighthouse(locationUrl).then((results) => {
        Object.assign(auditResults, results);
      });
    });

    it('should exceed performance threshold', () => {
      cy.wrap(auditResults.performance).should('be.gte', passThreshold.performance);
    });

    it('should exceed accessibility threshold', () => {
      cy.wrap(auditResults.accessibility).should('be.gte', passThreshold.accessibility);
    });

    it('should exceed best-practices threshold', () => {
      cy.wrap(auditResults['best-practices']).should('be.gte', passThreshold['best-practices']);
    });
  });
});
