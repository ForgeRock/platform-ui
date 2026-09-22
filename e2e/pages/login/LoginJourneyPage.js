/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class LoginJourneyPage {
  static get usernameInput() {
    return cy.findByLabelText(/user ?name/i, { timeout: 20000 });
  }

  // Anchor inside the Login journey's PageNode description (rendered via v-html).
  static get createAccountLink() {
    return cy.findByRole('link', { name: 'Create an account' });
  }
}
