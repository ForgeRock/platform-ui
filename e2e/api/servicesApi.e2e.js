/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Shared transport for AM realm service CRUD under `realm-config/services`.
 * Sub-resources are expressed as a URL suffix, e.g.
 *   getService('oauth-oidc', { subresource: '/scriptedJwtIssuers/my-issuer' })
 */

function servicesUrl(serviceId, { subresource = '', realmPath } = {}) {
  const realm = realmPath ?? (Cypress.env('IS_FRAAS') ? 'realms/alpha/' : '');
  return `https://${Cypress.env('FQDN')}/am/json/realms/root/${realm}realm-config/services/${serviceId}${subresource}`;
}

function headers() {
  return {
    Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
    'Content-Type': 'application/json',
    'Accept-API-Version': 'protocol=2.1,resource=1.0',
  };
}

export function getService(serviceId, { subresource, realmPath, ...options } = {}) {
  return cy.request({
    method: 'GET',
    url: servicesUrl(serviceId, { subresource, realmPath }),
    headers: headers(),
    ...options,
  });
}

export function deleteService(serviceId, { subresource, realmPath, ...options } = {}) {
  return cy.request({
    method: 'DELETE',
    url: servicesUrl(serviceId, { subresource, realmPath }),
    headers: headers(),
    ...options,
  });
}
