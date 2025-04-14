/**
 * Copyright 2021-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

// eslint-disable-next-line import/prefer-default-export
export function clickBreadcrumb() {
  cy.findByRole('navigation', { name: 'Breadcrumb' }).should('be.visible').click();
}
