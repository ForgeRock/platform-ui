/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

/**
 * Normalizes whitespace in a string by replacing consecutive whitespace
 * characters with a single space and trimming leading/trailing spaces.
 *
 * @param {string} text - The input string to normalize.
 * @returns {string} The normalized string.
 */
const normalizeText = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * Helper function to type text or keyboard shortcuts in the code editor
 * @param {string} input - The text or keyboard shortcut to type
 */
const typeInCodeEditor = (input) => {
  cy.get('.cm-content')
    .click()
    .type(input);
};

/**
 * Clicks on the test script execution button (play button)
 * This step clicks the button that executes/tests the endpoint script
 */
When('user clicks on {codeEditorIconButton} icon button in code editor', (selector) => {
  cy.get(selector)
    .should('exist')
    .should('be.visible')
    .click();
});

/**
 * Types text in the code editor
 * This step types the specified text into the CodeMirror editor
 * Usage: user types "some text" in the code editor
 * @param {string} text - The text to type into the editor
 */
When('user types {string} in the code editor', (text) => {
  typeInCodeEditor(text);
});

/**
 * Performs a keyboard shortcut in the code editor
 * This step simulates the specified keyboard shortcut in the CodeMirror editor
 * Usage: user performs the undo keyboard shortcut
 * @param {string} shortcut - The keyboard shortcut to perform (resolved from KEYBOARD_ACTIONS)
 */
When('user performs the {shortcut} keyboard shortcut', (shortcut) => {
  typeInCodeEditor(shortcut);
});

/**
 * Verifies that specific text exists in the code editor
 * This step checks if the given text is present in the CodeMirror editor
 * @param {string} text - The text to look for in the editor
 */
Then('the code editor contains the following code:', (expectedCode) => {
  cy.get('.cm-content').invoke('text').then((actualText) => {
    expect(normalizeText(actualText)).to.include(normalizeText(expectedCode));
  });
});

/**
 * Verifies that specific text either exists or does not exist in the code editor.
 * This step checks if the given text is present or absent in the CodeMirror editor's content area.
 * Usage examples in feature files:
 *   Then('the code editor contains "some text"')
 *   Then('the code editor does not contain "some text"')
 * @param {string} condition - Either 'contains' or 'does not contain', determines the assertion type.
 * @param {string} text - The text to check for presence or absence in the editor.
 */
Then(/^the code editor (contains|does not contain) "([^"]*)"$/, (condition, text) => {
  const assertion = condition === 'contains' ? 'contain.text' : 'not.contain.text';
  cy.get('.cm-content')
    .should('be.visible')
    .and(assertion, text);
});
