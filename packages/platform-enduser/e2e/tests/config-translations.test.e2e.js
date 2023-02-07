/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import { addOverrides, deleteOverrides } from '../api/localizationApi.e2e';

const enTranslations = {
  enduser: {
    sideMenu: {
      profile: 'Profile Test',
    },
  },
  shared: {
    sideMenu: {
      dashboard: 'Dashboard Test',
    },
  },
};

filterTests(['forgeops', 'cloud'], () => {
  describe('Enduser config translations', () => {
    let userName;
    let userId;

    retryableBeforeEach(() => {
      // Login as an admin to get an access token
      cy.loginAsAdmin().then(() => {
        // add config translation override
        addOverrides('en', enTranslations);

        // create test user
        userName = `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`;
        createIDMUser({ userName }).then(({ body: { _id: responseUserId } }) => {
          userId = responseUserId;
          cy.logout();
        });
      });
    });

    it('should override text based on translations stored in config', () => {
      cy.loginAsEnduser(userName);
      cy.findByRole('link', { name: 'Profile Test' }).should('exist');
      cy.findByRole('link', { name: 'Dashboard Test' }).should('exist');
    });

    // cleanup
    after(() => {
      deleteOverrides('en');
      deleteIDMUser(userId);
    });
  });
});
