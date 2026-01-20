/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

function getUIConfiguration(accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/ui/configuration`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    retryOnStatusCodeFailure: true,
  });
}

function updateUIConfiguration(uiConfig, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/ui/configuration`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: uiConfig,
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Activates or deactivates hosted account pages setting.
 *
 * @param {boolean} enabled - true to activate, false to deactivate hosted account pages
 * @param {string} [accessToken] - Bearer token for authentication
 * @returns {Promise} Cypress request promise
 */
export function setHostedAccountPagesActive(enabled, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return getUIConfiguration(accessToken).then((response) => {
    const uiConfig = response.body;
    uiConfig.configuration.platformSettings.hostedPages = enabled;
    return updateUIConfiguration(uiConfig, accessToken);
  });
}

/**
 * Activates or deactivates hosted journey pages setting.
 *
 * @param {boolean} enabled - true to activate, false to deactivate hosted journey pages
 * @param {string} [accessToken] - Bearer token for authentication
 * @returns {Promise} Cypress request promise
 */
export function setHostedJourneyPagesActive(enabled, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return getUIConfiguration(accessToken).then((response) => {
    const uiConfig = response.body;
    uiConfig.configuration.platformSettings.hostedJourneyPages = enabled;
    return updateUIConfiguration(uiConfig, accessToken);
  });
}
