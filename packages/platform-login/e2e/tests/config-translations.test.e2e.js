/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '../../../../e2e/util';
import addOverrides, { deleteOverrides } from '../api/localizationApi.e2e';

const enTranslations = {
  login: {
    login: {
      next: 'Next Test',
    },
    overrides: {
      UserName: 'User Name Test',
      Password: 'Password Test',
      Loginfailure: 'Login Failure Override',
    },
  },
};

const frTranslations = {
  login: {
    login: {
      next: 'Suivant Test',
    },
    overrides: {
      UserName: 'Nom d\'utilisateur Test',
    },
  },
};

const frcaTranslations = {
  login: {
    login: {
      next: 'Suivant Test frca',
    },
  },
};

const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

filterTests(['forgeops', 'cloud'], () => {
  describe('Login config translations', () => {
    let accessToken;
    const loginBaseUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${realm}&authIndexType=service&authIndexValue=Login`;

    // add config translation override
    before(() => {
      // get admin access token
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
      cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
      cy.login();

      // user token to write translations to config
      cy.wait('@getAccessToken').then(({ response }) => {
        accessToken = response.body.access_token;
        addOverrides(accessToken, 'en', enTranslations);
        addOverrides(accessToken, 'fr', frTranslations);
        addOverrides(accessToken, 'fr-ca', frcaTranslations);
        cy.clearCookies();
      });
    });

    it('should override the text of the next button, username placeholder, and password placeholder', () => {
      cy.visit(`${loginBaseUrl}#/`);
      cy.findByRole('button', { name: 'Next Test' }).should('exist');
      cy.findByPlaceholderText('User Name Test').should('exist');
      cy.findByPlaceholderText('Password Test').should('exist');
    });

    it('should override the text of the login failure message', () => {
      cy.intercept('/openidm/config/ui/themerealm').as('themeRealConfig');
      cy.visit(`${loginBaseUrl}#/`);
      cy.findByRole('button', { name: 'Next Test' }).should('exist').click();
      cy.wait('@themeRealConfig');
      cy.findAllByRole('alert').contains('Login Failure Override');
    });

    it('should display french overrides when locale query parameter is fr', () => {
      cy.visit(`${loginBaseUrl}&locale=fr#/`);
      cy.findByRole('button', { name: 'Suivant Test' }).should('exist');
      cy.findByPlaceholderText('Nom d\'utilisateur Test').should('exist');

      // english fallback is used when french is not present
      cy.findByPlaceholderText('Password Test').should('exist');
    });

    it('should fallback to a general locale when a specific one is not present', () => {
      cy.visit(`${loginBaseUrl}&locale=fr-ca#/`);
      // fr-ca
      cy.findByRole('button', { name: 'Suivant Test frca' }).should('exist');
      // fr
      cy.findByPlaceholderText('Nom d\'utilisateur Test').should('exist');
      // en
      cy.findByPlaceholderText('Password Test').should('exist');
    });

    // cleanup
    after(() => {
      deleteOverrides(accessToken, 'en');
      deleteOverrides(accessToken, 'fr');
      deleteOverrides(accessToken, 'fr-ca');
    });
  });
});
