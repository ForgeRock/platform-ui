/**
 * Copyright 2021-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Get a config translation file
 */
export function getOverrides(locale, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    failOnStatusCode: false,
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/uilocale/${locale}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Add a config translation file
 */
export function addOverrides(locale, body, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/uilocale/${locale}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
  });
}

/**
 * Delete a config translation file
 */
export function deleteOverrides(locale, failOnStatusCodeToggle = true, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    failOnStatusCode: failOnStatusCodeToggle,
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/uilocale/${locale}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}
