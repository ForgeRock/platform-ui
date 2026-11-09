/**
 * Copyright 2024-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { random } from 'lodash';

export function createIDMResource(resourceType = 'managed', resourceName, body, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}?_action=create`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
  });
}

/**
 * Use idm provisioning token to create super-user
 * Creates a user with
 * username: 'e2eTestUser<RandomNumber>',
 * password: 'Rg_GRg9k&e',
 * First Name: 'First'
 * Last Name: 'Last'
 */
export function createIDMUser(userBody) {
  const body = {
    userName: `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`,
    password: 'Rg_GRg9k&e',
    givenName: 'First',
    sn: 'Last',
    mail: 'forgerockdemo@example.com',
    ...userBody,
  };
  return createIDMResource('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', body);
}

export function deleteIDMResource(resourceType = 'managed', resourceName, id, accessToken = Cypress.env('ACCESS_TOKEN').access_token, failOnStatusCode = true) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}/${id}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    failOnStatusCode,
  });
}

export function deleteIDMUser(id, failOnStatusCode = true) {
  return deleteIDMResource('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', id, Cypress.env('ACCESS_TOKEN').access_token, failOnStatusCode);
}

/**
 * Creates a user with the openidm-admin authorization role in the tenant's user realm
 * (bravo_user on cloud, root's user on ForgeOps) — the subject the AIC connector's
 * client-credentials token maps to.
 * @param {string} userName - Username (and mail) for the user
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response with the created user (body._id)
 */
export function createIDMAdminUser(userName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const userResource = Cypress.env('IS_FRAAS') ? 'bravo_user' : 'user';
  return createIDMResource('managed', userResource, {
    userName,
    givenName: 'e2e',
    sn: 'admin',
    mail: userName,
    authzRoles: [{ _ref: 'internal/role/openidm-admin' }],
  }, accessToken);
}

/**
 * Deletes the openidm-admin user created by createIDMAdminUser.
 * @param {string} userId - The user id to delete
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the delete request
 */
export function deleteIDMAdminUser(userId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const userResource = Cypress.env('IS_FRAAS') ? 'bravo_user' : 'user';
  return deleteIDMResource('managed', userResource, userId, accessToken, false);
}

/**
 * Creates the AIC connector's OIDC client, named after an existing openidm-admin user
 * so IDM maps the client-credentials token's subject to that user (client_credentials,
 * fr:idm:*). Lives in the user's realm: bravo on cloud, root on ForgeOps.
 * @param {string} userId - Id of the user the client is named after
 * @param {string} clientSecret - Secret for the client
 * @returns {Cypress.Chainable} The response from the create request
 */
export function createAicOAuth2Client(userId, clientSecret = '123') {
  const realmPath = Cypress.env('IS_FRAAS') ? 'realms/root/realms/bravo' : 'realms/root';
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json/${realmPath}/realm-config/agents/OAuth2Client/${userId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: {
      coreOAuth2ClientConfig: {
        userpassword: clientSecret,
        scopes: ['fr:idm:*'],
        clientType: 'Confidential',
        tokenEndpointAuthMethod: 'client_secret_basic',
      },
      advancedOAuth2ClientConfig: {
        grantTypes: ['client_credentials'],
      },
    },
  });
}

/**
 * Deletes the OAuth2 client created by createAicOAuth2Client.
 * @param {string} clientId - The OAuth2 client ID to delete
 * @returns {Cypress.Chainable} The response from the delete request
 */
export function deleteAicOAuth2Client(clientId) {
  const realmPath = Cypress.env('IS_FRAAS') ? 'realms/root/realms/bravo' : 'realms/root';
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json/${realmPath}/realm-config/agents/OAuth2Client/${clientId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}

export function addRoleMember(roleId, userId, resourceType = 'internal') {
  const accessToken = Cypress.env('ACCESS_TOKEN').access_token;
  let requestResourceType;
  if (resourceType === 'internal') {
    requestResourceType = 'role';
  } else {
    requestResourceType = Cypress.env('IS_FRAAS') ? 'alpha_role' : 'role';
  }
  return cy.request({
    method: 'PATCH',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${requestResourceType}/${roleId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: [{
      field: `/${resourceType === 'internal' ? 'authzMembers' : 'members'}/-`,
      operation: 'add',
      value: {
        _ref: `managed/${Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user'}/${userId}`,
        _refProperties: {},
      },
    }],
  });
}

/**
 * Assigns dashboard apps to a user in AM
 * @param {*} userId
 */
export function assignUserDashboard(userId, dashboards) {
  const userRealm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/${userRealm}/users/${userId}/services/dashboard`,
    body: {
      assignedDashboard: dashboards,
    },
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
  });
}

export function getIDMResource(resourceType = 'config', resourceName = 'managed', accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
  });
}

export function putIDMResource(resourceType = 'config', resourceName = 'managed', body, accessToken = Cypress.env('ACCESS_TOKEN').access_token, waitForCompletion = false) {
  const url = `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}${waitForCompletion ? '?waitForCompletion=true' : ''}`;
  return cy.request({
    method: 'PUT',
    url,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
  });
}

export function getMappings(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/sync/mappings?_queryFilter=/source%20sw%20"managed/"`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
  });
}

export function saveMappings(mappings, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/sync`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: {
      mappings,
    },
  });
}

export function deleteMapping(mappingId, mappings, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const removalIndex = mappings.findIndex((mapping) => mapping._id === mappingId);
  if (removalIndex > -1) {
    mappings.splice(removalIndex, 1);
    return saveMappings(mappings, accessToken);
  }
  return false;
}
