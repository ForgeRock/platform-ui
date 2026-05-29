/**
 * Copyright 2021-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export function clickBreadcrumb() {
  cy.findByRole('navigation', { name: 'Header navigation' })
    .should('be.visible')
    .find('[aria-label^="Back to"]')
    .click();
}
