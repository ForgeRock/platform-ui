/**
 * Creates am identity? Works, but not sure if we should use this
 */
export function createAMTestUser() {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/authenticate`,
    headers: {
      'X-OpenAM-Username': Cypress.env('AM_USERNAME'),
      'X-OpenAM-Password': Cypress.env('AM_PASSWORD'),
      'content-type': 'application/json',
      'accept-api-version': 'resource=2.1',
    },
  }).then(() => cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/users/?_action=create`,
    body: {
      username: 'ForgerockDemo',
      userpassword: 'forgerock',
      mail: 'forgerockdemo@example.com',
    },
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'accept-api-version': 'protocol=2.1,resource=3.0',
    },
  }));
}

/**
 * Log in with user credentials through service/Login tree
 *
 * @param {String} userName user login username
 * @param {String} password user login password
 */
export function loginUser(userName, password) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/authenticate`,
    headers: {
      'X-OpenAM-Username': userName,
      'X-OpenAM-Password': password,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'resource=2.0, protocol=1.0',
    },
    body: {},
    verify: false,
  });
}

/**
 * Use idm provisioning token to create super-user
 * Creates a user with
 * username: 'e2eTestUser<RandomNumber>',
 * password: 'Welcome1',
 * First Name: 'First'
 * Last Name: 'Last'
 */
export function createIDMTestUser() {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/user?_action=create`,
    headers: {
      authorization: `Bearer ${JSON.parse(Cypress.env('ACCESS_TOKEN')).access_token}`,
      'content-type': 'application/json',
    },
    body: {
      userName: `e2eTestUser${Math.floor(Math.random() * Math.floor(1000))}`,
      password: 'Welcome1',
      givenName: 'First',
      sn: 'Last',
      mail: 'forgerockdemo@example.com',
    },
  });
}

/**
 * Delete user, but does not currently work as idm provisioning is not allowed to perform delete
 * @param {*} userId
 */
export function deleteIDMTestUser(userId) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/user/${userId}`,
    headers: {
      authorization: `Bearer ${JSON.parse(Cypress.env('ACCESS_TOKEN')).access_token}`,
      'content-type': 'application/json',
      referer: `https://${Cypress.env('FQDN')}/platform/appAuthHelperRedirect.html`,
    },
  }).then(() => {});
}

export function logoutUser() {
  cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/authentication?_action=logout`,
    headers: {
      'X-OpenIDM-NoSession': 'false',
      'X-OpenIDM-Username': 'anonymous',
      'X-OpenIDM-Password': 'anonymous',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: {},
    verify: false,
  });
}
