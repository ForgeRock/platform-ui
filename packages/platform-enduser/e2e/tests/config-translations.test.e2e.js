/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import filterTests from '../../../../e2e/filter_tests';
import { createIDMUser } from '../api/managedApi.e2e';
import addOverrides, { deleteOverrides } from '../api/localizationApi.e2e';

const enTranslations = {
  enduser: {
    sideMenu: {
      profile: 'Profile Test',
    },
    pages: {
      dashboard: {
        widgets: {
          welcome: {
            welcomeMessage: 'Welcome Message Test',
          },
        },
      },
    },
  },
  shared: {
    sideMenu: {
      dashboard: 'Dashboard Test',
    },
  },
};

filterTests(['forgeops'], () => {
  describe('Enduser config translations', () => {
    let accessToken;
    let userName;

    before(() => {
      // create test user
      userName = `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`;
      createIDMUser({ userName });

      // get admin access token
      cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
      cy.login(Cypress.env('AM_USERNAME'), Cypress.env('AM_PASSWORD'), `${Cypress.config().baseUrl}/platform/`);

      cy.wait('@getAccessToken').then(({ response }) => {
        // add config translation override
        accessToken = response.body.access_token;
        addOverrides(accessToken, 'en', enTranslations);
        cy.logout();
      });
    });

    it('should override text based on translations stored in config', () => {
      cy.login(userName);
      cy.findByRole('link', { name: 'Profile Test' }).should('exist');
      cy.findByRole('link', { name: 'Dashboard Test' }).should('exist');
      cy.findByText('Welcome Message Test').should('exist');
      cy.logout();
    });

    // cleanup
    after(() => {
      deleteOverrides(accessToken, 'en');
    });
  });
});
