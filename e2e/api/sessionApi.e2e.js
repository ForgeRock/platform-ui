/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const loginRealm = Cypress.env('IS_FRAAS') ? 'realms/alpha/' : '';

/**
* performs a POST request with the getSessionInfo action as a url param
*/
export default function fetchSessionInfo() {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}sessions?_action=getSessionInfo`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=1.0,resource=2.1',
    },
  });
}
