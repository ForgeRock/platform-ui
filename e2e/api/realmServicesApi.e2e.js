/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const realmServiceUrl = (realmName, serviceId) => `https://${Cypress.env('FQDN')}/am/json/realms/root/realms/${realmName}/realm-config/services/${serviceId}`;

/**
 * Realm Settings "Settings" tab services, keyed by UI row title. Ids and paths
 * mirror the route meta in packages/platform-admin/config/routes/*.js.
 */
export const REALM_SERVICES = {
  Session: {
    id: 'session',
    path: '/realm/settings/session',
  },
  'Session Property Whitelist': {
    id: 'amSessionPropertyWhitelist',
    path: '/realm/settings/session-property-whitelist',
  },
  Validation: {
    id: 'validation',
    path: '/realm/settings/validation',
  },
  'Device Profiles': {
    id: 'deviceProfilesService',
    path: '/realm/settings/device-profiles',
  },
};

/**
 * Gets a realm service by id; 404 means it is not created (shown as Off).
 */
export function getRealmService(realmName, serviceId) {
  return cy.request({
    method: 'GET',
    url: realmServiceUrl(realmName, serviceId),
    headers: { 'Accept-API-Version': 'protocol=2.1,resource=1.0' },
    failOnStatusCode: false,
  });
}

/**
 * Deletes a realm service if it exists, resolving with its body or null.
 */
export function deleteRealmService(realmName, serviceId) {
  return getRealmService(realmName, serviceId).then((getResponse) => {
    if (getResponse.status !== 200) return null;
    const serviceBody = { ...getResponse.body };
    delete serviceBody._rev;
    delete serviceBody._id;
    return cy.request({
      method: 'DELETE',
      url: realmServiceUrl(realmName, serviceId),
      headers: { 'Accept-API-Version': 'protocol=2.1,resource=1.0' },
      failOnStatusCode: false,
    }).then(() => serviceBody);
  });
}

/**
 * Creates a realm service with an explicit configuration body.
 */
export function createRealmService(realmName, serviceId, serviceBody) {
  return cy.request({
    method: 'POST',
    url: `${realmServiceUrl(realmName, serviceId)}?_action=create`,
    headers: {
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: serviceBody,
    failOnStatusCode: false,
  });
}
