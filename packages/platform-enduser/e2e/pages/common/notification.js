/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// eslint-disable-next-line import/prefer-default-export
export function expectNotification(message) {
  cy.findByRole('alert', { name: message }).should('exist');
}
