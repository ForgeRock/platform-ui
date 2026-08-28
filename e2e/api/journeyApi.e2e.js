/**
 * Copyright 2024-2026 ForgeRock AS. All Rights Reserved
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

/**
 * GET a tree by id from the realm-config authenticationtrees endpoint. Mirrors
 * the UI's `getTree(treeId, forExport=true)` call (packages/platform-shared/src/
 * api/TreeApi.js) — i.e. no `?forUI=true` — so the response body's `.nodes` map
 * can be walked to delete each inner node, matching `deleteTreeAndNodes` in
 * TreeManagementMixin.vue.
 */
export function getTreeForExport(id) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha' : '/realms/root';
  const resource = 'realm-config/authentication/authenticationtrees/trees';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json${realm}/${resource}/${id}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}

/**
 * DELETE an inner tree node using the v3 nodes API — matches the UI's
 * `deleteNode(nodeId, nodeType, nodeVersion)` (TreeApi.js), which uses
 * `Accept-API-Version: protocol=2.1,resource=3.0`.
 */
export function deleteTreeNode(nodeType, nodeVersion, nodeId) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha' : '/realms/root';
  const resource = 'realm-config/authentication/authenticationtrees/nodes';
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json${realm}/${resource}/${nodeType}/${nodeVersion}/${nodeId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=3.0',
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
      const { status, body: template } = res;
      expect(status).to.equal(200);

      cy.request({
        method: 'PUT',
        url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realmUrl}/realm-config/authentication/authenticationtrees/trees/${name}`,
        headers: {
          'content-type': 'application/json',
          'Accept-API-Version': 'protocol=2.1,resource=1.0',
        },
        body: {
          ...template,
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
