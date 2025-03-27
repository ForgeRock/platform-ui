/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { addOverrides, deleteOverrides } from '../api/localizationApi.e2e';
import { prepareJourneyTemplate } from '../utils/manageJourneys';

const legacyScriptContent = '"var javaImports = JavaImporter(\\n    org.forgerock.openam.auth.node.api.Action,\\n    javax.security.auth.callback.ConfirmationCallback,\\n    javax.security.auth.callback.TextOutputCallback\\n)\\nvar NodeOutcome = {\\n    LOGIN: \\"login\\",\\n    CANCEL: \\"cancel\\"\\n}\\nvar config = {\\n    MESSAGE_PROMPT: \\"loginText\\",\\n    BUTTONS: [\\"block1.block1Nested\\", \\"block1.block2.block2Nested\\", \\"loginOverrideText\\", \\n             \\"reallyLongOverridesTestToCheckIfTranslationsCanHandleSuchALongKeyAndStillLoadCorrectTranslationAndDisplayItCorrectlyOnTheLoginPage\\",\\n             \\"sharedText\\", \\"sharedOverrideText\\",\\n             \\"adminText\\", \\"enduserText\\"],\\n    LOGIN_ACTION_PRESSED: 0,\\n    CANCEL_ACTION_PRESSED: 1\\n}\\nif (callbacks.isEmpty()) {\\n  action = javaImports.Action.send(\\n    javaImports.TextOutputCallback(javaImports.TextOutputCallback.INFORMATION, config.MESSAGE_PROMPT),\\n    javaImports.ConfirmationCallback(javaImports.ConfirmationCallback.INFORMATION, config.BUTTONS, 1)\\n  ).build();\\n} else {\\n    var userSelection = callbacks[0].getSelectedIndex();\\n    if (userSelection === config.LOGIN_ACTION_PRESSED) {\\n        action = fr.Action.goTo(NodeOutcome.LOGIN).build();\\n    } else {\\n        action = fr.Action.goTo(NodeOutcome.CANCEL).build();\\n    }\\n}\\n"';
const legacyScriptVersion = '1.0';
const nextGenerationScriptContent = '"var NodeOutcome = {\\n    LOGIN: \\"login\\",\\n    CANCEL: \\"cancel\\"\\n}\\nvar config = {\\n    MESSAGE_PROMPT: \\"loginText\\",\\n    BUTTONS: [\\"block1.block1Nested\\", \\"block1.block2.block2Nested\\", \\"loginOverrideText\\", \\n             \\"reallyLongOverridesTestToCheckIfTranslationsCanHandleSuchALongKeyAndStillLoadCorrectTranslationAndDisplayItCorrectlyOnTheLoginPage\\",\\n             \\"sharedText\\", \\"sharedOverrideText\\",\\n             \\"adminText\\", \\"enduserText\\"],\\n    LOGIN_ACTION_PRESSED: 0,\\n    CANCEL_ACTION_PRESSED: 1\\n}\\nif (callbacks.isEmpty()) {\\n    callbacksBuilder.textOutputCallback(0, config.MESSAGE_PROMPT);\\n    callbacksBuilder.confirmationCallback(0, config.BUTTONS, 1);\\n} else {\\n    var userSelection = callbacks[0].getSelectedIndex();\\n    if (userSelection === config.LOGIN_ACTION_PRESSED) {\\n        action.goTo(\\"login\\");\\n    } else {\\n        action.goTo(\\"cancel\\");\\n    }\\n}\\n"';
const nextGenerationScriptVersion = '2.0';
let preparedJourney;

const translations = {
  login: {
    loginText: "This is test of message translations from 'login' block",
    block1: {
      block1Nested: 'This message is nested in the first block',
      block2: {
        block2Nested: 'This message is nested in the second block',
      },
    },
    overrides: {
      loginOverrideText: "This is test of message translations from 'login/overrides' block",
      reallyLongOverridesTestToCheckIfTranslationsCanHandleSuchALongKeyAndStillLoadCorrectTranslationAndDisplayItCorrectlyOnTheLoginPage: 'Really long overrides test to check if translations can handle such a long key and still load correct translation and display it correctly on the login page',
    },
  },
  shared: {
    sharedText: 'This is test of message translations from \'shared\' block',
    overrides: {
      sharedOverrideText: 'This is test of message translations from \'shared/overrides\' block',
    },
  },
  admin: {
    adminText: 'This is test of message translations from \'admin\' block',
  },
  enduser: {
    enduserText: 'This is test of message translations from \'enduser\' block',
  },
};

// Setup before running Feature file
before(() => {
  // Login as admin
  if (Cypress.spec.relative.includes('scripted-confirmationcallbacks.feature')) {
    // Login as admin
    cy.loginAsAdmin().then(() => {
      // Add translation override config for 'en' locale
      addOverrides('en', translations);
    });
  }
});

// Cleanup after running Feature file
after(() => {
  // Login as admin
  if (Cypress.spec.relative.includes('scripted-confirmationcallbacks.feature')) {
    // Login as admin
    cy.loginAsAdmin().then(() => {
      // Delete translation override config for 'en' locale
      deleteOverrides('en');
    });
  }
});

Given('journey template {string} is imported with {string} Decision Node Script', (journeyName, scriptType) => {
  const journeyTemplate = `${journeyName}_template.json`;

  // Prepare Journey template with correct Script version
  if (scriptType === 'Legacy') {
    preparedJourney = prepareJourneyTemplate(journeyTemplate, { script_content: legacyScriptContent, script_version: legacyScriptVersion });
  } else if (scriptType === 'Next Generation') {
    preparedJourney = prepareJourneyTemplate(journeyTemplate, { script_content: nextGenerationScriptContent, script_version: nextGenerationScriptVersion });
  } else {
    throw new Error(`Unknown Script Type: ${scriptType}`);
  }

  // Import prepared Journey
  cy.importTreesViaAPI([preparedJourney]);
});

Then('translations for Scripted ConfirmationCallbacks for {string} locale are correct', () => {
  // Check translations are correctly applied for messages
  cy.findByRole('heading').contains(translations.login.loginText).should('be.visible');

  // Check translations are correctly applied for buttons from 'login' and 'shared' block
  cy.findByRole('button', { name: translations.login.block1.block1Nested }).should('be.visible');
  cy.findByRole('button', { name: translations.login.block1.block2.block2Nested }).should('be.visible');
  cy.findByRole('button', { name: translations.login.overrides.loginOverrideText }).should('be.visible');
  cy.findByRole('button', { name: translations.login.overrides.reallyLongOverridesTestToCheckIfTranslationsCanHandleSuchALongKeyAndStillLoadCorrectTranslationAndDisplayItCorrectlyOnTheLoginPage }).should('be.visible');
  cy.findByRole('button', { name: translations.shared.sharedText }).should('be.visible');
  cy.findByRole('button', { name: translations.shared.overrides.sharedOverrideText }).should('be.visible');

  // Check translations are not applied for buttons from 'admin' and 'enduser' block
  cy.findByRole('button', { name: 'adminText' }).should('be.visible');
  cy.findByRole('button', { name: 'enduserText' }).should('be.visible');
  cy.findByRole('button', { name: translations.admin.adminText }).should('not.exist');
  cy.findByRole('button', { name: translations.enduser.enduserText }).should('not.exist');
});
