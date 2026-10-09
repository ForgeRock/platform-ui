/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const AI_AGENT_REALM = () => (Cypress.env('IS_FRAAS') ? '/realms/alpha' : '');
const AI_AGENT_RESOURCE = () => (Cypress.env('IS_FRAAS') ? 'alpha_aiagent' : 'aiagent');

/**
 * Queries the IDM managed object for an AI Agent by its OAuth2 client id.
 * The agents list page reads from IDM, and the IDM object is synced from AM
 * (where the UI creates agents), so this is the read path Step 03 asserts on.
 * @param {string} clientId the OAuth2 client id of the agent
 * @param {string} accessToken Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the query request
 */
export function getAIAgentByIdmClientId(clientId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const filter = encodeURIComponent(`oauth2ClientId eq "${clientId}"`);
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${AI_AGENT_RESOURCE()}?_queryFilter=${filter}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}

/**
 * Deletes an AI Agent from the AM agents endpoint by its id (the OAuth2 client id).
 * @param {string} agentId the id of the agent to delete
 * @param {string} accessToken Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the delete request
 */
export function deleteAIAgent(agentId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root${AI_AGENT_REALM()}/realm-config/agents/AIAgent/${agentId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.0,resource=2.0',
    },
    failOnStatusCode: false,
  });
}
