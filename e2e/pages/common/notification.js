/**
 * Copyright 2020-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export function expectNotification(message) {
  cy.findByRole('alert', { name: message }).should('be.visible');
}

export function expectAndCloseNotification(message) {
  cy.findByRole('alert', { name: message })
    .should('be.visible')
    .find('button')
    .should('exist')
    .click();
}
