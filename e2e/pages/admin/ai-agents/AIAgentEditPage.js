/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page Object Model for the AI Agent edit page (/ai-agents/:agentId),
 * shown after an agent is created.
 */
export default class AIAgentEditPage {
  // Page header
  static agentHeading(agentName) {
    return cy.findByRole('heading', { level: 1, name: agentName });
  }

  // FrSchemaStateButton renders the current state ("Active"/"Inactive") as the
  // dropdown toggle text.
  static get statusButton() {
    return cy.findByRole('button', { name: /active|inactive/i });
  }
}
