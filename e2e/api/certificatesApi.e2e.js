/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export function getAllCsrs(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/environment/csrs/`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    retryOnStatusCodeFailure: true,
  });
}

export function deleteCsr(csrId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/environment/csrs/${csrId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    retryOnStatusCodeFailure: true,
  });
}
