/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class LoginSteps {
  static loginAsDefaultEnduser() {
    const userName = Cypress.env('endUserName');
    const password = Cypress.env('endUserPassword');
    cy.loginAsEnduser(userName, password, false);
  }
}
