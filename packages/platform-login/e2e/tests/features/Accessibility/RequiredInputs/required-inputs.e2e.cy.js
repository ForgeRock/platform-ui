/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';
import apiSteps from '@e2e/steps/apiSteps';
import { JOURNEYS } from '@e2e/support/constants';
import { getIDMThemes } from '@e2e/api/journeyApi.e2e';
import { random } from 'lodash';
import enduser from '../../../../persona/enduserSteps';

const REQUIRED_REGISTRATION_LABELS = ['Username', 'First Name', 'Last Name', 'Email Address'];
// Cloud renders the login label as "User Name"; ForgeOps as "Username"
const REQUIRED_LOGIN_LABELS = [/User ?Name/i, 'Password'];
const JOURNEY_NAMES = [JOURNEYS.DEFAULT_LOGIN.name, JOURNEYS.DEFAULT_REGISTRATION.name];
const CUSTOM_PROPERTY = `e2eRequiredProp${random(Number.MAX_SAFE_INTEGER)}`;
const CUSTOM_REGISTRATION_JOURNEY = `Registration${random(Number.MAX_SAFE_INTEGER)}`;

describe('Required inputs', { tags: ['@cloud', '@forgeops'] }, () => {
  let testedThemes = [];

  before({ testTimeout: 120000 }, () => {
    let fullPropertyName;
    const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

    // Clone registration journey and add a custom required property.
    cy.loginAsAdminCached()
      .then(() => apiSteps.journey.cloneJourney(
        JOURNEYS.DEFAULT_REGISTRATION.name,
        CUSTOM_REGISTRATION_JOURNEY,
      ))
      .then(() => apiSteps.managedObject.addRequiredUserProperty(CUSTOM_PROPERTY))
      .then((property) => {
        fullPropertyName = property;
        return apiSteps.journeyNode.addRequiredAttributeCollectorProperty(
          CUSTOM_REGISTRATION_JOURNEY,
          fullPropertyName,
        );
      })
      .then(() => apiSteps.journeyNode.waitForJourneyReady(
        CUSTOM_REGISTRATION_JOURNEY,
        30,
        fullPropertyName,
      ))
      .then(() => getIDMThemes())
      .then(({ body }) => {
        testedThemes = body.realm[realm].filter((theme) => (
          theme.isDefault || (theme.linkedTrees || [])
            .some((name) => JOURNEY_NAMES.includes(name))
        ));
        return cy.wrap(testedThemes).each((theme) => (
          apiSteps.themes.snapshotThemeFields(theme.name, ['journeyShowAsteriskForRequiredFields'])
        ));
      })
      .then(() => cy.wrap(testedThemes).each((theme) => (
        apiSteps.themes.updateThemeFields(theme.name, { journeyShowAsteriskForRequiredFields: true })
      )));
  });

  retryableBeforeEach(() => {
    cy.loginAsAdminCached();
  });

  after(() => {
    cy.loginAsAdminCached().then(() => {
      apiSteps.managedObject.removeRequiredUserProperties();
      apiSteps.journey.deleteCreatedJourneys();
      apiSteps.journeyNode.setJourneyUsernameValidation(JOURNEYS.DEFAULT_LOGIN.name, false);
      apiSteps.themes.restoreAllMutatedThemes();
    });
  });

  it('[TC-13003] Mandatory fields in the registration journey', () => {
    enduser.login.logout();

    // Navigate directly to the Registration journey — all required fields are
    // notified with the (*) asterisk indicator
    enduser.requiredInputs.visit(JOURNEYS.DEFAULT_REGISTRATION.name);
    enduser.requiredInputs.assertAsteriskOnLabels(REQUIRED_REGISTRATION_LABELS);

    // Refresh the enduser browser page, asterisk indicator still shows
    enduser.requiredInputs.visit(JOURNEYS.DEFAULT_REGISTRATION.name);
    enduser.requiredInputs.assertAsteriskOnLabels(REQUIRED_REGISTRATION_LABELS);

    // Reach the registration form indirectly via the 'Create an account' link
    // on the Login journey
    enduser.requiredInputs.visit(JOURNEYS.DEFAULT_LOGIN.name);
    enduser.requiredInputs.goToRegistrationFromLoginJourney();

    enduser.requiredInputs.assertAsteriskOnLabels(REQUIRED_REGISTRATION_LABELS);

    // Refresh the enduser browser page, asterisk indicator still shows
    enduser.browser.refreshPage();
    enduser.requiredInputs.assertAsteriskOnLabels(REQUIRED_REGISTRATION_LABELS);
  });

  it('[TC-13005] Login journey shows required fields when Validate username set', () => {
    // Enable "Validate username" on the Platform Username node of the default
    // Login journey (admin session from retryableBeforeEach)
    apiSteps.journeyNode.setJourneyUsernameValidation(JOURNEYS.DEFAULT_LOGIN.name, true);

    enduser.login.logout();

    // Navigate to the Login journey — Username and Password fields have a red
    // asterisk after their label
    enduser.requiredInputs.visit(JOURNEYS.DEFAULT_LOGIN.name);
    enduser.requiredInputs.assertAsteriskOnLabels(REQUIRED_LOGIN_LABELS);

    // Leave username field empty and tab off it (into password field) —
    // required-field validation message appears under the Username field
    enduser.requiredInputs.assertRequiredValidationMessage();

    // Refresh the enduser browser page, asterisk indicator still shows
    enduser.requiredInputs.visit(JOURNEYS.DEFAULT_LOGIN.name);
    enduser.requiredInputs.assertAsteriskOnLabels(REQUIRED_LOGIN_LABELS);
  });

  it('[TC-13004] Custom required property in registration attribute collector', () => {
    enduser.login.logout();
    enduser.requiredInputs.visit(CUSTOM_REGISTRATION_JOURNEY);
    enduser.requiredInputs.assertAsteriskOnLabels([CUSTOM_PROPERTY]);

    enduser.browser.refreshPage();
    enduser.requiredInputs.assertAsteriskOnLabels([CUSTOM_PROPERTY]);
  });
});
