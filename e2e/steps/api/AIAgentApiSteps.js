/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { deleteAIAgent, getAIAgentByIdmClientId } from '@e2e/api/aiAgentsApi.e2e';

export default class AIAgentApiSteps {
  static createdAgentIds = [];

  static trackCreatedAgent(agentId) {
    if (!AIAgentApiSteps.createdAgentIds.includes(agentId)) {
      AIAgentApiSteps.createdAgentIds.push(agentId);
    }
  }

  /**
   * Intercepts the UI's agent-creation PUT against the AM agents endpoint.
   * The list page reads agents from the IDM managed object, which is synced
   * from AM asynchronously — waiting on this intercept before asserting on the
   * list closes the sync window that otherwise causes flakes.
   */
  static interceptAgentCreation() {
    cy.intercept('PUT', '**/realm-config/agents/AIAgent/*').as('createAIAgent');
  }

  /**
   * Waits on the intercepted UI creation, then polls the IDM managed object
   * (the read path the list page uses) until the agent appears there.
   * The intercept is awaited once — the UI emits a single creation PUT — and
   * only the IDM lookup recurses.
   * @param {string} agentId the OAuth2 client id of the created agent
   * @param {number} attempts remaining poll attempts
   */
  static waitForAgentInIdm(agentId, attempts = 20) {
    return cy.wait('@createAIAgent', { timeout: 10000 })
      .then(() => AIAgentApiSteps.pollAgentInIdm(agentId, attempts));
  }

  /**
   * Polls the IDM managed object until the agent synced from AM appears.
   * An IDM CREST query returns 200 with an empty result array (not a 404)
   * when the record has not synced yet, so the body is what gets checked.
   * @param {string} agentId the OAuth2 client id of the created agent
   * @param {number} attempts remaining poll attempts
   */
  static pollAgentInIdm(agentId, attempts) {
    if (attempts <= 0) {
      throw new Error(`AI Agent ${agentId} did not appear in the IDM managed object before the list assertion`);
    }
    return getAIAgentByIdmClientId(agentId).then((response) => {
      if (response.status !== 200) {
        throw new Error(`Unexpected ${response.status} while waiting for AI Agent ${agentId} in IDM`);
      }
      if (response.body.result?.length) {
        return response;
      }
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      return cy.wait(500).then(() => AIAgentApiSteps.pollAgentInIdm(agentId, attempts - 1));
    });
  }

  static deleteCreatedAgents() {
    return cy.wrap(AIAgentApiSteps.createdAgentIds).then((ids) => {
      if (!ids.length) return cy.wrap(null);
      return cy.wrap(ids).each((id) => deleteAIAgent(id).then((response) => {
        if (response.status !== 404 && !response.isOkStatusCode) {
          throw new Error(`Failed to delete AI Agent ${id} — tenant may be in a dirty state. Status: ${response.status}`);
        }
      })).then(() => {
        // Cleared only after every delete has been attempted, so a failed run
        // still tracks the remaining agents for the retry.
        AIAgentApiSteps.createdAgentIds = [];
      });
    });
  }
}
