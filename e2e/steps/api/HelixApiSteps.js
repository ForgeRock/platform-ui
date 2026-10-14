/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Helix support for the Journey AI specs: conversation stubs (below) and the
 * serving-bundle feature-flag override.
 *
 * Stubs the three Helix endpoints the Journey AI chat drives. The UI (see
 * `packages/platform-admin/src/services/journeyAIService.js`):
 *   1. POSTs `{agent:{version}}` to create a conversation
 *   2. POSTs the user message and reads back its `message_id`
 *   3. Polls the channel GET (newest-first array) until the submitted
 *      `message_id` appears, then takes everything newer than it —
 *      exactly one message, with `sender_role === 'agent'`
 *
 * The agent message `value` must be a JSON STRING (parseResponse
 * JSON.parses it): `{"response": "...", "potentialUserQuestions": [...]}`.
 * A non-JSON `value` renders an "Unexpected end of JSON input" error bubble.
 *
 * Message ids are dynamic: the POST-message handler captures the id the UI
 * will receive, and the GET handler swaps the fixture's user-message id for
 * it. No fixture state survives between tests; each stubbed conversation is
 * self-contained.
 */
export default class HelixApiSteps {
  static conversationId = 'conv-e2e-stub';

  static homeChannel = 'chan-e2e-stub';

  static agentMessageId = 'agent-msg-e2e-stub';

  static submittedUserMessageId = null;

  /**
   * Test-only serving-bundle override, for verifying the Journey AI specs
   * against tenants whose build has `VUE_APP_ENABLE_JOURNEY_AI` baked off
   * (no tenant has a flag-on build yet — FRAAS-34389). Rewrites the flag to
   * `"true"` inside every served admin app bundle (webpack duplicates the
   * env object across ~10 sites, so this must be a GLOBAL replace). Arms the
   * intercept before any page load, so it must be called before the first
   * `cy.visit` of each test.
   *
   * Inactive unless CYPRESS_FORCE_JOURNEY_AI=true, so CI against flag-off
   * tenants keeps the honest skip path.
   */
  static flipBundleFlag() {
    if (String(Cypress.env('FORCE_JOURNEY_AI')) !== 'true') return;

    cy.intercept('GET', '**/js/app*.js', (req) => {
      req.reply((res) => {
        if (res.statusCode === 200 && typeof res.body === 'string') {
          res.body = res.body
            .replace(/VUE_APP_ENABLE_JOURNEY_AI:"false"/g, 'VUE_APP_ENABLE_JOURNEY_AI:"true"');
        }
        res.send();
      });
    }).as('flippedAppBundle');
  }

  /**
   * Builds the polled messages array for a conversation. The user message id
   * is swapped to the one the app actually received from the POST reply — the
   * polling loop resolves only when the array contains that exact id, with
   * the agent response before it.
   */
  static buildMessagesArray(agentValue) {
    return [
      {
        message_id: HelixApiSteps.agentMessageId,
        sender_role: 'agent',
        value: agentValue,
      },
      {
        message_id: HelixApiSteps.submittedUserMessageId || 'user-msg-e2e-stub',
        sender_role: 'user',
        value: 'stubbed user message',
      },
    ];
  }

  /**
   * Arms all three intercepts. `agentValue` must be a JSON string (the
   * pre-parsed `value` of the agent message). Returns the `@agentMessages`
   * wait target through the usual `.as()` aliasing.
   *
   * @param {String} agentValue JSON-stringified agent response body
   */
  static stubConversation(agentValue) {
    HelixApiSteps.submittedUserMessageId = null;

    cy.intercept('POST', '**/agents/JourneyAIAgent/conversations', {
      id: HelixApiSteps.conversationId,
      home_channel: HelixApiSteps.homeChannel,
    }).as('createConversation');

    cy.intercept('POST', `**/conversations/${HelixApiSteps.conversationId}/channels/${HelixApiSteps.homeChannel}/messages`, (req) => {
      req.reply({ message_id: 'user-msg-e2e-stub' });
      HelixApiSteps.submittedUserMessageId = 'user-msg-e2e-stub';
    }).as('postUserMessage');

    cy.intercept('GET', `**/conversations/${HelixApiSteps.conversationId}/channels/${HelixApiSteps.homeChannel}/messages`, (req) => {
      req.reply(HelixApiSteps.buildMessagesArray(agentValue));
    }).as('agentMessages');
  }

  /**
   * Builds a JSON-string agent value with markdown response and follow-up
   * suggestions — the shape `submitConversationQuery` expects.
   *
   * @param {String} response markdown body
   * @param {Array} potentialUserQuestions follow-up suggestion strings
   */
  static agentValue(response, potentialUserQuestions = []) {
    return JSON.stringify({ response, potentialUserQuestions });
  }

  /**
   * Waits for the full round trip (conversation created, message posted,
   * polled at least once). Polls recur every 200ms, so a single wait only
   * proves the first poll; tests asserting on the rendered response call
   * this once.
   */
  static awaitConversation() {
    cy.wait('@createConversation');
    cy.wait('@postUserMessage');
    cy.wait('@agentMessages');
  }
}
