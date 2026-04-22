/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const CUSTOM_DOMAIN_BASE_URL = (realm) => `https://${Cypress.env('FQDN')}/environment/custom-domains/${realm}`;

/**
 * Gets all custom domains for a realm
 */
export function getCustomDomains(realm, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: CUSTOM_DOMAIN_BASE_URL(realm),
    headers: {
      authorization: `Bearer ${accessToken}`,
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Adds a custom domain to a realm by fetching the existing list and appending the new domain
 */
export function addCustomDomain(realm, domain, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getCustomDomains(realm, accessToken).then((getResponse) => {
    const existingDomains = getResponse.body.domains || [];
    return cy.request({
      method: 'PUT',
      url: CUSTOM_DOMAIN_BASE_URL(realm),
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'accept-api-version': 'protocol=1.0,resource=1.0',
      },
      body: {
        domains: [...existingDomains, domain],
      },
      retryOnStatusCodeFailure: true,
    });
  });
}

/**
 * Deletes a custom domain from a realm by fetching the existing list and removing the domain
 */
export function deleteCustomDomain(realm, domain, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  const { failOnStatusCode = true } = options;
  return getCustomDomains(realm, accessToken).then((getResponse) => {
    const existingDomains = (getResponse.body.domains || []).filter((d) => d !== domain);
    return cy.request({
      method: 'PUT',
      url: CUSTOM_DOMAIN_BASE_URL(realm),
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'accept-api-version': 'protocol=1.0,resource=1.0',
      },
      body: {
        domains: existingDomains,
      },
      failOnStatusCode,
      retryOnStatusCodeFailure: failOnStatusCode,
    });
  });
}

/**
 * Verifies an existing custom domain (corresponds to Re-verify action)
 */
export function verifyCustomDomain(domain, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/environment/custom-domains?_action=verify`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
    body: {
      name: domain,
    },
    retryOnStatusCodeFailure: true,
  });
}
