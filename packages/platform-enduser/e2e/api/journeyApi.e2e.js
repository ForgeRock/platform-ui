const defaultRealm = Cypress.env('IS_FRAAS') ? '/alpha/' : '';
const defaultResource = 'authentication/authenticationtrees/trees';

// AM API
// GET
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

// DELETE
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

// PUT
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

// POST
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

// IDM API
// GET
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

// DELETE
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

// PUT
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
