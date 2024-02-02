/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Support file used to execute code in each e2e test file and able to use hooks and the cy and Cypress objects

let testFailed = false;

before(() => {
  cy.recordHar();
});

// eslint-disable-next-line func-names
afterEach(function () {
  testFailed = this.currentTest.state === 'failed';
});

after(() => {
  if (testFailed) {
    cy.saveHar();
  } else {
    cy.disposeOfHar();
  }
});
