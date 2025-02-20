/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Support file used to execute code in each e2e test file and able to use hooks and the cy and Cypress objects

let testFailed = false;

before(() => {
  if (Cypress.browser.name === 'chrome') {
  // If the browser is Chrome, start recording HTTP Archive (HAR)
  // Note: cy.recordHar is only compatible with Chrome
    cy.recordHar();
  }
});

// eslint-disable-next-line func-names
afterEach(function () {
  if (this.currentTest.state === 'failed') {
    testFailed = true;
  }
});

after(() => {
  if (Cypress.browser.name === 'chrome') {
    if (testFailed) {
      // If any test has failed, save the recorded HAR
      // Note: cy.saveHar is only compatible with Chrome
      cy.saveHar();
    } else {
      // If no test has failed, dispose of the recorded HAR
      // Note: cy.disposeOfHar is only compatible with Chrome
      cy.disposeOfHar();
    }
  }
});
