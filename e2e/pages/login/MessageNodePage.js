/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Selectors for AM MessageNode screens
 */
export default class MessageNodePage {
  static outcomeMessage(messageText) {
    return cy.findByText(messageText, { timeout: 20000 });
  }

  static confirmButton(messageText, optionLabel = 'Yes') {
    return cy.findByRole('group', { name: messageText, timeout: 20000 })
      .findByRole('button', { name: optionLabel });
  }
}
