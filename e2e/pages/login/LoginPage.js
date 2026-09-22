/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class LoginPage {
  static get heading() {
    return cy.findByRole('heading', { name: 'Sign In', level: 1 });
  }

  static get forgotUsernameLink() {
    return cy.findByRole('link', { name: 'Forgot username?' });
  }

  static get forgotPasswordLink() {
    return cy.findByRole('link', { name: 'Forgot password?' });
  }

  static get userNameInput() {
    return cy.findByLabelText('User Name');
  }

  static get passwordInput() {
    return cy.findByLabelText('Password');
  }

  static get showPasswordButton() {
    return cy.findByRole('button', { name: 'Show Password' });
  }

  static get nextButton() {
    return cy.findByRole('button', { name: 'Next' });
  }

  // Tab order measured on the default admin login page (no skip link, no footer by default).
  static focusOrder = [
    'forgotUsernameLink',
    'forgotPasswordLink',
    'userNameInput',
    'passwordInput',
    'showPasswordButton',
    'nextButton',
  ];
}
