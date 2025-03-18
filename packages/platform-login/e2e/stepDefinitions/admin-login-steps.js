/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { When } from '@badeball/cypress-cucumber-preprocessor';

/**
 * Logs in the user with valid or invalid credentials.
 * @param {string} scenario - The type of credentials to use ('valid' or 'invalid').
 */
When('admin logs in with {string} credentials', (scenario) => {
  switch (scenario) {
    case 'invalid':
      cy.findByLabelText(/User Name/i, { timeout: 20000 }).type('invalidUsername');
      cy.findAllByLabelText(/Password/i).first().type('invalidPassword');
      cy.findByRole('button', { name: 'Next' }).click();
      break;
    case 'valid':
      cy.loginAsAdmin();
      break;
    default:
      console.error('Invalid step');
      break;
  }
});
