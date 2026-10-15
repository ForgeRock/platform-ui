/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';
import apiSteps from '@e2e/steps/apiSteps';
import { getAMResource, putAMResource } from '@e2e/api/journeyApi.e2e';
import { getDefaultProviderConfig, putEmailProviderConfig } from '@e2e/api/emailApi.e2e';
import { JOURNEYS } from '@e2e/support/constants';
import { setEmailProviderConfigByAccount, getLastEmail, extractLinkFromEmail } from '../../../utils/emailUtils';
import enduser from '../../../persona/enduserSteps';

const EMAIL_WAIT_TIMEOUT_MS = 30000;
const FAILURE_URL_NODE_ID = '944aecc3-783c-4244-97d2-c6cc9b6a6807';
const FAILURE_URL_FRAGMENT = 'gotoOnFail=email-suspend-redirect';

const getRealmConfig = () => (Cypress.env('IS_FRAAS')
  ? '/realms/root/realms/alpha/realm-config/'
  : '/realms/root/realm-config/');

describe('Email Suspend Redirect', { tags: ['@cloud', '@forgeops'] }, () => {
  let userEmail;

  before(() => {
    cy.loginAsAdminCached();
    apiSteps.journey.importJourney({ name: JOURNEYS.EMAIL_SUSPEND_REDIRECT.name });
    cy.wrap(null).then(() => getAMResource(
      getRealmConfig(),
      'authentication/authenticationtrees/trees',
      JOURNEYS.EMAIL_SUSPEND_REDIRECT.name,
    ).then((response) => {
      expect(response.status, 'journey imported on tenant').to.equal(200);
    }));

    cy.wrap(null).then(() => {
      const realm = getRealmConfig();
      const nodeResource = 'authentication/authenticationtrees/nodes/SetFailureUrlNode';

      return getAMResource(realm, nodeResource, FAILURE_URL_NODE_ID).then((response) => {
        const node = response.body;
        delete node._rev;
        node.failureUrl = `${Cypress.config().baseUrl}/am/XUI/?${FAILURE_URL_FRAGMENT}`;
        return putAMResource(realm, nodeResource, FAILURE_URL_NODE_ID, node).then((putResponse) => {
          expect(putResponse.status).to.equal(200);
          expect(putResponse.body.failureUrl).to.contain(FAILURE_URL_FRAGMENT);
        });
      });
    });

    cy.wrap(null).then(() => cy.task('getTestEmailAccount').then((account) => {
      userEmail = account.user;
      Cypress.env('emailAccount', account);
      return getDefaultProviderConfig().then((config) => {
        Cypress.env('defaultEmailConfig', config.body);
        return setEmailProviderConfigByAccount(account).then(() => apiSteps.user.createEndUser({ mail: account.user })).then(() => cy.logout());
      });
    }));
  });

  after(() => {
    cy.loginAsAdminCached().then(() => {
      apiSteps.user.deleteCreatedUsers();
      apiSteps.journey.deleteImportedJourneys();
      const defaultEmailConfig = Cypress.env('defaultEmailConfig');
      if (defaultEmailConfig) {
        putEmailProviderConfig(defaultEmailConfig);
      }
    });
  });

  retryableBeforeEach(() => {
    enduser.login.logout();
  });

  it('[C25121] Redirect after email suspend node flow', () => {
    enduser.emailSuspendJourney.visit();
    enduser.emailSuspendJourney.submitEmail(userEmail);
    enduser.emailSuspendJourney.assertSuspendMessageVisible();

    getLastEmail({ timeout: EMAIL_WAIT_TIMEOUT_MS });
    cy.get('@emailObject').then((emailObject) => {
      const resumeLink = extractLinkFromEmail(emailObject.body || emailObject);
      expect(resumeLink, 'resume link found in email').to.not.equal(false);

      enduser.emailSuspendJourney.openEmailLink(resumeLink);
      enduser.emailSuspendJourney.assertYesNoPageVisible();
      enduser.emailSuspendJourney.clickNo();

      enduser.emailSuspendJourney.assertRedirectedToFailureUrl(FAILURE_URL_FRAGMENT);
    });
  });
});
