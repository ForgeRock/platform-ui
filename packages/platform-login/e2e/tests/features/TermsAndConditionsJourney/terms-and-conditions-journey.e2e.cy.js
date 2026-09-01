/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { retryableBeforeEach } from '@e2e/util';
import apiSteps from '@e2e/steps/apiSteps';
import setTerms from '@e2e/api/consentApi.e2e';
import { getDefaultProviderConfig, putEmailProviderConfig } from '@e2e/api/emailApi.e2e';
import { JOURNEYS } from '@e2e/support/constants';
import generateRandomEndUser from '@e2e/utils/endUserData';
import { setEmailProviderConfigByAccount } from '../../../utils/emailUtils';
import enduser from '../../../persona/enduserSteps';

describe('Terms and Conditions Journey', { tags: ['@cloud', '@forgeops'] }, () => {
  const TERMS_CONTENT = 'If you see this text, then the Terms and Conditions are working correctly and showing the currently active version!';
  const TERMS_BODY = {
    active: JOURNEYS.ACCEPT_TERMS_AND_CONDITIONS.name,
    versions: [
      {
        version: '0.0',
        termsTranslations: {
          en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        },
        createDate: '2019-10-28T04:20:11.320Z',
      },
      {
        version: JOURNEYS.ACCEPT_TERMS_AND_CONDITIONS.name,
        termsTranslations: { en: TERMS_CONTENT },
        createDate: '2024-06-27T17:00:13.205Z',
      },
    ],
  };

  const USER_PASSWORD = Cypress.env('END_USER_PASSWORD') || generateRandomEndUser().password;

  // Setup user for the no-prompt assertion test: registered via the Default Registration Journey.
  let registeredUserName;
  const registeredUserFirstName = 'TAndCTester';

  before(() => {
    apiSteps.journey.importJourney({ name: JOURNEYS.ACCEPT_TERMS_AND_CONDITIONS.name });

    cy.wrap(null).then(() => {
      // Activate a known T&C version so the login journey has deterministic content to assert.
      setTerms(TERMS_BODY);

      cy.task('getTestEmailAccount').then((account) => {
        registeredUserName = account.user + random(Number.MAX_SAFE_INTEGER);

        setEmailProviderConfigByAccount(account);
        enduser.login.logout();

        enduser.registration.navigate();
        enduser.registration.fillForm({
          username: registeredUserName,
          firstName: registeredUserFirstName,
          lastName: registeredUserFirstName,
          email: account.user,
          password: USER_PASSWORD,
        });
        enduser.registration.submitAndComplete(account);
        enduser.login.logout();
      });
    });
  });

  after(() => {
    cy.loginAsAdminCached().then(() => {
      apiSteps.user.deleteCreatedUsers();
      apiSteps.journey.deleteImportedJourneys();
      setTerms();
      getDefaultProviderConfig().then((config) => putEmailProviderConfig(config.body));
    });
  });

  retryableBeforeEach(() => {
    enduser.login.logout();
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  });

  it('[C20718] User without accepted T&C is prompted on login', () => {
    // Created per attempt: accept() persists T&C on the user record, so retries need a fresh user.
    apiSteps.user.createEndUser({ password: USER_PASSWORD }).then((user) => {
      enduser.termsAndConditionsJourney.visit();
      enduser.termsAndConditionsJourney.loginWithCredentials(user.username, USER_PASSWORD);

      enduser.termsAndConditionsJourney.assertPromptVisible();

      enduser.browser.refreshPage();

      enduser.termsAndConditionsJourney.loginWithCredentials(user.username, USER_PASSWORD);
      enduser.termsAndConditionsJourney.assertPromptVisible();

      enduser.termsAndConditionsJourney.openModal();
      enduser.termsAndConditionsJourney.assertModalContent(TERMS_CONTENT);
      enduser.termsAndConditionsJourney.closeModal();

      enduser.termsAndConditionsJourney.accept();
      enduser.login.assertOnDashboard(user.firstName);
    });
  });

  it('[C20723] User that accepted T&C during registration is not prompted on login', () => {
    enduser.termsAndConditionsJourney.visit();
    enduser.termsAndConditionsJourney.loginWithCredentials(registeredUserName, USER_PASSWORD);

    enduser.termsAndConditionsJourney.assertPromptNotVisible();
    enduser.login.assertOnDashboard(registeredUserFirstName);
  });
});
