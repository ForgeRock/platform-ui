/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expectAndCloseNotification } from './notification';

/**
 * Creates a new Theme with the given name.
 * @param {string} themeName - The name of the Theme.
 */
export function createNewTheme(themeName) {
  // Click on the New Theme button
  cy.findByRole('button', { name: 'New Theme' }).click();

  // Fill in the Theme name, save the Theme and wait for the save to complete
  cy.findByRole('dialog', { name: 'New Theme' }).within(() => {
    cy.findByLabelText('Name').type(themeName);
    cy.intercept('PUT', '/openidm/config/ui/themerealm').as('saveTheme');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.wait('@saveTheme');
  });
  // Check the dialog is no longer present
  cy.findByRole('dialog', { name: 'New Theme' }).should('not.exist');

  // Check that Save notification is correctly displayed
  expectAndCloseNotification('Theme successfully saved');
}

/**
 * Sets the given Theme as the default theme for the realm.
 * @param {string} themeName - The name of the Theme.
 */
export function setThemeAsDefault(themeName) {
  // Search for our Theme in the list
  cy.findByLabelText('Search').clear().type(`${themeName}{enter}`);
  cy.findByRole('status', { timeout: 5000 }).should('not.exist');

  // Find correct theme in the Themes table
  cy.findByRole('row', { name: `${themeName}` }).should('be.visible').within(() => {
    // Click on the correct Theme row burger menu
    cy.findByRole('button').click();
    // Non-default theme should have 4 options, check all of them are correctly displayed
    cy.findAllByRole('menuitem').should('have.length', 4);
    cy.findByRole('menuitem', { name: 'Edit' }).should('exist');
    cy.findByRole('menuitem', { name: 'Duplicate' }).should('exist');
    cy.findByRole('menuitem', { name: 'Delete' }).should('exist');
    // Set the Theme as the Realm Default
    cy.findByRole('menuitem', { name: 'Set as Realm Default' }).should('exist').click({ force: true });
  });
  // Check that Save notification is correctly displayed
  expectAndCloseNotification('Theme successfully saved');

  // Check that the Theme is now the Realm Default
  cy.findByRole('row', { name: `${themeName} Realm Default` }).should('exist');

  // Find correct theme in the Themes table
  cy.findByRole('row', { name: `${themeName} Realm Default` }).within(() => {
    // Click on the correct Theme row burger menu
    cy.findByRole('button').click();
    // Default theme should have 2 options, check all of them are correctly displayed
    cy.findAllByRole('menuitem').should('have.length', 2);
    cy.findByRole('menuitem', { name: 'Edit' }).should('exist');
    cy.findByRole('menuitem', { name: 'Duplicate' }).should('exist');
    cy.findByRole('menuitem', { name: 'Set as Realm Default' }).should('not.exist');
    cy.findByRole('menuitem', { name: 'Delete' }).should('not.exist');
  });
}

/**
 * Deletes the Theme with the given name.
 * @param {string} themeName - The name of the Theme.
 */
export function deleteTheme(themeName) {
  // Search for our Theme in the list
  cy.findByLabelText('Search').clear().type(`${themeName}{enter}`);
  cy.findByRole('status', { timeout: 5000 }).should('not.exist');

  // Find correct theme in the Themes table
  cy.findByRole('row', { name: `${themeName}` }).within(() => {
    // Click on the correct Theme row burger menu
    cy.findByRole('button').click();
    cy.findByRole('menuitem', { name: 'Delete' }).should('exist').click({ force: true });
  });

  // Confirm the Theme deletion
  cy.findByRole('dialog', { name: 'Delete Theme?' }).within(() => {
    cy.findByRole('button', { name: 'Delete' }).click();
  });
  // Check the dialog is no longer present
  cy.findByRole('dialog', { name: 'Delete Theme?', timeout: 10000 }).should('not.exist');

  // Check that Delete notification is correctly displayed
  expectAndCloseNotification('Theme successfully deleted');

  // Check that the Theme is no longer present in the Themes table
  cy.findByRole('row', { name: `${themeName}` }).should('not.exist');
}

/**
 * Saves the changes made to the Theme.
 */
export function saveThemeEdit() {
  // Click on the Breadcrumb to leave the editor
  cy.findByRole('navigation', { name: 'Breadcrumb' }).click();

  // Fill in the Theme name, save the Theme and wait for the save to complete
  cy.findByRole('dialog', { name: 'Really Leave?' }).within(() => {
    cy.intercept('PUT', '/openidm/config/ui/themerealm').as('saveTheme');
    cy.findByRole('button', { name: 'Save and Leave' }).should('be.visible').click();
    cy.wait('@saveTheme');
  });
  // Check the dialog is no longer present
  cy.findByRole('dialog', { name: 'Really Leave?' }).should('not.exist');

  // Check that Save notification is correctly displayed
  expectAndCloseNotification('Theme successfully saved');
}

/**
 * Changes the color value of the given name to the specified value.
 * @param {string} name - The name of the color option.
 * @param {string} value - The new color value.
 */
export function changeColorValue(name, value) {
  // Find the correct color option
  cy.findByRole('button', { name }).scrollIntoView().click();
  // Clear the previous color value and type in the new color value
  cy.findByRole('tooltip').findByLabelText('hex').clear().type(value);
  // Check that the color value has been correctly set
  cy.findByRole('button', { name }).scrollIntoView().contains(`#${value}`);
  // Close the color picker
  cy.findByRole('tab', { name: 'Styles' }).click({ force: true });
  // Check that the color picker has been closed
  cy.findByRole('tooltip').should('not.exist');
}
