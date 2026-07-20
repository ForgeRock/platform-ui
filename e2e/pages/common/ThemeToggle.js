/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ThemeToggle {
  static get themeToggleButton() {
    return cy.findByRole('button', { name: /toggle theme/i });
  }

  static get themeToggleIcon() {
    return ThemeToggle.themeToggleButton.find('.material-icons-outlined');
  }

  static get themeDropdownMenu() {
    return cy.get('#theme-toggle-dropdown .dropdown-menu');
  }

  static get lightModeOption() {
    return cy.findByRole('menuitem', { name: /light mode/i });
  }

  static get darkModeOption() {
    return cy.findByRole('menuitem', { name: /dark mode/i });
  }

  static get body() {
    return cy.get('body');
  }

  static get mainNavbar() {
    return cy.get('[data-testid="fr-main-navbar"]');
  }
}
