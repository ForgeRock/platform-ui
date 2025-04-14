/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const defaultRealm = Cypress.env('IS_FRAAS') ? '/alpha/' : '';
const defaultResource = 'authentication/authenticationtrees/trees';
const realmUrl = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';

export function getAMResource(realm = defaultRealm, resource = defaultResource, id) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json${realm}${resource}/${id}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    retryOnStatusCodeFailure: true,
  });
}

export function postAMResource(realm = defaultRealm, resource = defaultResource, body) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json${realm}${resource}?_action=create`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=1.0,resource=1.0',
    },
    body,
    failOnStatusCode: false,
  });
}

export function putAMResource(realm = defaultRealm, resource = defaultResource, id, body) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json${realm}${resource}/${id}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body,
    retryOnStatusCodeFailure: true,
  });
}

export function deleteAMResource(realm = defaultRealm, resource = defaultResource, id) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json${realm}${resource}/${id}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}

export function getIDMResource(resourceType = 'managed', resourceName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    retryOnStatusCodeFailure: true,
  });
}

export function getIDMThemes() {
  return getIDMResource('config/ui', 'themerealm');
}

export function putIDMResource(resourceType = 'managed', resourceName, body, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
    retryOnStatusCodeFailure: true,
  });
}

export function deleteIDMResource(resourceType = 'managed', resourceName, id, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}/${id}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    failOnStatusCode: false,
  });
}

export function createJourney(name, identityResource = 'managed/user', categories = ['QA_autotests']) {
  return new Cypress.Promise((resolve) => {
    cy.request({
      method: 'POST',
      url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realmUrl}/realm-config/authentication/authenticationtrees/trees?_action=template`,
      headers: {
        'content-type': 'application/json',
        'Accept-API-Version': 'protocol=2.1,resource=1.0',
      },
    }).then((res) => {
      const { status, body: { entryNodeId } } = res;
      expect(status).to.equal(200);

      cy.request({
        method: 'PUT',
        url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realmUrl}/realm-config/authentication/authenticationtrees/trees/${name}`,
        headers: {
          'content-type': 'application/json',
          'Accept-API-Version': 'protocol=2.1,resource=1.0',
        },
        body: {
          entryNodeId,
          nodes: {},
          staticNodes: {},
          description: '',
          identityResource,
          uiConfig: {
            categories: JSON.stringify(categories),
          },
        },
      }).then((response) => {
        resolve(response);
      });
    });
  });
}
