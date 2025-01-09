/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * This request gets the Security Questions configuration of the tenant, response is an object including all SQ and configuration data.
}
 * @returns {Cypress.Chainable} Request response
 */

export function getSecurityQuestions() {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/selfservice.kba`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * This method sends a PUT request to the Security Questions endpoint to modify the object, these changes will be reflected on both Admin and Enduser UIs as both use the same object
 * @param {*} securityQuestionsObject Security questions object
 * @returns {Cypress.Chainable} Request response
 */

export function putSecurityQuestions(securityQuestionsObject) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/selfservice.kba`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
    },
    body: securityQuestionsObject,
  });
}
