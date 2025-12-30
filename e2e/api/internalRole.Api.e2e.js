/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default function createInternalRole(roleData, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/internal/role?_action=create`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: roleData,
    retryOnStatusCodeFailure: true,
  });
}

export function addUserToInternalRole(roleId, userId, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  const userAssignmentPatch = [{
    operation: 'add',
    field: '/authzMembers/-',
    value: {
      _ref: `managed/alpha_user/${userId}`,
      _refProperties: {},
    },
  }];

  return cy.request({
    method: 'PATCH',
    url: `https://${Cypress.env('FQDN')}/openidm/internal/role/${roleId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: userAssignmentPatch,
    retryOnStatusCodeFailure: true,
  });
}
