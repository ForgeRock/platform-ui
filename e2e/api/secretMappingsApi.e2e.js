/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const realmConfigPath = Cypress.env('IS_FRAAS')
  ? '/realms/root/realms/alpha/realm-config'
  : '/realms/root/realm-config';
const mappingsUrl = `https://${Cypress.env('FQDN')}/am/json${realmConfigPath}/secrets/stores/GoogleSecretManagerSecretStoreProvider/ESV/mappings`;
const apiVersion = 'protocol=2.1,resource=1.0';

function request(method, url, body, failOnStatusCode = true) {
  return cy.request({
    method,
    url,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': apiVersion,
    },
    body,
    failOnStatusCode,
  });
}

export function getSecretMappings() {
  return request('GET', `${mappingsUrl}?_queryFilter=true`);
}

export function getAvailableSecretMappings() {
  return request('POST', `${mappingsUrl}?_action=schema`);
}

export function saveSecretMapping(secretLabel, alias) {
  return request('PUT', `${mappingsUrl}/${encodeURIComponent(secretLabel)}`, {
    aliases: [alias],
    secretId: secretLabel,
  });
}

export function deleteSecretMapping(secretLabel, failOnStatusCode = true) {
  return request('DELETE', `${mappingsUrl}/${encodeURIComponent(secretLabel)}`, undefined, failOnStatusCode);
}
