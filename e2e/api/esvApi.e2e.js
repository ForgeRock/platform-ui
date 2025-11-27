/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export function getAllSecrets(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/environment/secrets?_pagedResultsOffset=0&_pageSize=10&_sortKeys=_id`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    retryOnStatusCodeFailure: true,
  });
}

export function getAllVariables(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/environment/variables?_pagedResultsOffset=0&_pageSize=10&_sortKeys=_id`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    retryOnStatusCodeFailure: true,
  });
}

export function deleteSecret(secretName, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/environment/secrets/${secretName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    ...options,
  });
}

export function deleteVariable(variableName, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/environment/variables/${variableName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    ...options,
  });
}

export function createVariable(variableName, payload, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/environment/variables/${variableName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    body: payload,
    retryOnStatusCodeFailure: true,
  });
}

export function createSecret(secretName, payload, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/environment/secrets/${secretName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    body: payload,
    retryOnStatusCodeFailure: true,
  });
}

export function createSecretVersion(secretName, payload, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/environment/secrets/${secretName}/versions?_action=create`,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    body: payload,
    retryOnStatusCodeFailure: true,
  });
}
