/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import ThemeToggle from '@e2e/pages/common/ThemeToggle';

export default class ThemeSteps {
  static openThemeDropdown() {
    ThemeToggle.themeToggleButton.click();
    ThemeToggle.lightModeOption.should('be.visible');
  }

  static closeThemeDropdown() {
    ThemeToggle.themeToggleButton.click();
    ThemeToggle.themeDropdownMenu.should('not.have.class', 'show');
  }

  static selectDarkMode() {
    ThemeToggle.darkModeOption.click();
    ThemeSteps.assertDropdownClosed();
  }

  static selectLightMode() {
    ThemeToggle.lightModeOption.click();
    ThemeSteps.assertDropdownClosed();
  }

  static assertDropdownClosed() {
    ThemeToggle.themeDropdownMenu.should('not.have.class', 'show');
  }

  static assertDarkThemeActive() {
    cy.get('html').should('have.attr', 'data-theme', 'dark');
  }

  static assertLightThemeActive() {
    cy.get('html').should('not.have.attr', 'data-theme', 'dark');
  }

  static assertLightModeOptionActive() {
    ThemeToggle.lightModeOption.should('have.class', 'active');
    ThemeToggle.darkModeOption.should('not.have.class', 'active');
  }

  static assertDarkModeOptionActive() {
    ThemeToggle.darkModeOption.should('have.class', 'active');
    ThemeToggle.lightModeOption.should('not.have.class', 'active');
  }

  static assertDarkModeIcon() {
    ThemeToggle.themeToggleIcon.should('have.text', 'dark_mode');
  }

  static assertLightModeIcon() {
    ThemeToggle.themeToggleIcon.should('have.text', 'light_mode');
  }

  static assertThemePersistedInStorage(theme) {
    cy.window().its('localStorage').invoke('getItem', 'app-theme').should('eq', theme);
  }

  static assertDarkThemeColors() {
    ThemeToggle.body.should('have.css', 'background-color', 'rgb(35, 40, 46)');
    ThemeToggle.mainNavbar.should('have.css', 'background-color', 'rgb(35, 40, 46)');
  }

  static assertLightThemeColors() {
    ThemeToggle.body.should('have.css', 'background-color', 'rgb(246, 248, 250)');
    ThemeToggle.mainNavbar.should('have.css', 'background-color', 'rgb(255, 255, 255)');
  }
}
