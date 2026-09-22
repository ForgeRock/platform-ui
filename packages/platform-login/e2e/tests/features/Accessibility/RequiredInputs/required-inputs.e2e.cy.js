/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';
import apiSteps from '@e2e/steps/apiSteps';
import { JOURNEYS } from '@e2e/support/constants';
import enduser from '../../../../persona/enduserSteps';

const REQUIRED_REGISTRATION_LABELS = ['Username', 'First Name', 'Last Name', 'Email Address'];
// Cloud renders the login label as "User Name"; ForgeOps as "Username"
const REQUIRED_LOGIN_LABELS = [/User ?Name/i, 'Password'];

describe('Required inputs', { tags: ['@cloud', '@forgeops'] }, () => {
  retryableBeforeEach(() => {
    // Login as admin and enable the asterisk indicator on the default theme
    cy.loginAsAdminCached().then(() => {
      apiSteps.themes.setDefaultThemeAsteriskConfig(true);
    });
  });

  after(() => {
    // Restore default theme and Login journey configuration
    cy.loginAsAdminCached().then(() => {
      apiSteps.themes.setDefaultThemeAsteriskConfig(false);
      apiSteps.journeyNode.setJourneyUsernameValidation(JOURNEYS.DEFAULT_LOGIN.name, false);
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
});
