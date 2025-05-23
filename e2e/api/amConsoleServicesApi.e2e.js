/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const loginRealm = Cypress.env('IS_FRAAS') ? 'realms/alpha/' : '';

export function getValidTogoDestinations() {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}realm-config/services/validation`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
    },
  });
}

export function putValidTogoDestinations(validTogoDestinationsBody) {
  delete validTogoDestinationsBody._rev;
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}realm-config/services/validation`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: validTogoDestinationsBody,
  });
}

export function createSessionService(sessionParams) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}realm-config/services/session?_action=create`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: {
      dynamic: {
        maxIdleTime: sessionParams.MaximumIdleTime || 30,
        maxSessionTime: sessionParams.MaximumSessionTime || 120,
        quotaLimit: sessionParams.ActiveUserSessions || 5,
        maxCachingTime: sessionParams.MaximumCachingTime || 3,
      },
      _id: '',
      _type: {
        _id: 'session',
        name: 'Session',
        collection: false,
      },
    },
  });
}

export function getSessionService() {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}realm-config/services/session`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}

export function deleteSessionService(sessionBody) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}realm-config/services/session`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: sessionBody,
  });
}
