/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const AM_REALMS_URL = () => `https://${Cypress.env('FQDN')}/am/json/global-config/realms`;
const AM_REALM_CONFIG_URL = (realmName) => `https://${Cypress.env('FQDN')}/am/json/realms/root/realms/${realmName}/realm-config/authentication`;

export function listRealms() {
  return cy.request({
    method: 'GET',
    url: `${AM_REALMS_URL()}?_queryFilter=true`,
    headers: { 'Accept-API-Version': 'protocol=1.0,resource=1.0' },
    retryOnStatusCodeFailure: true,
  });
}

export function createRealm(realmName) {
  return cy.request({
    method: 'POST',
    url: `${AM_REALMS_URL()}?_action=create`,
    headers: {
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.0,resource=1.0',
    },
    body: {
      active: true,
      parentPath: '/',
      name: realmName,
      aliases: [],
    },
    retryOnStatusCodeFailure: true,
  }).then((response) => cy.request({
    method: 'PUT',
    url: AM_REALM_CONFIG_URL(realmName),
    headers: {
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=1.0,resource=1.0',
    },
    body: { statelessSessionsEnabled: false },
    retryOnStatusCodeFailure: true,
  }).then(() => response));
}

export function deleteRealm(realmName, options = {}) {
  const { failOnStatusCode = true } = options;
  return listRealms().then((listResponse) => {
    const realm = (listResponse.body.result || []).find((r) => r.name === realmName);
    if (!realm) return null;
    return cy.request({
      method: 'DELETE',
      url: `${AM_REALMS_URL()}/${encodeURIComponent(realm._id)}`,
      headers: { 'Accept-API-Version': 'protocol=2.0,resource=1.0' },
      failOnStatusCode,
    });
  });
}

export function setRealmActive(realmName, active, options = {}) {
  const { failOnStatusCode = true } = options;
  return listRealms().then((listResponse) => {
    const realm = (listResponse.body.result || []).find((r) => r.name === realmName);
    if (!realm) return null;
    const body = { ...realm, active };
    delete body._rev;
    return cy.request({
      method: 'PUT',
      url: `${AM_REALMS_URL()}/${encodeURIComponent(realm._id)}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept-API-Version': 'protocol=2.0,resource=1.0',
      },
      body,
      failOnStatusCode,
    });
  });
}
