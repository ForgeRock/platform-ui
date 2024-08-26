/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random, find } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import {
  createNewTheme,
  setThemeAsDefault,
  deleteTheme,
  saveThemeEdit,
  changeColorValue,
} from '../pages/common/hostedPages';
import { getThemesList } from '../api/themeApi.e2e';

filterTests(['forgeops', 'cloud'], () => {
  describe('Enduser Theming', () => {
    const enduserRealm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
    const loginRealm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
    const hostedPagesUrl = `${Cypress.config().baseUrl}/platform/?realm=${loginRealm}#/hosted-pages`;
    const enduserProfileUrl = `${Cypress.config().baseUrl}/enduser/?realm=${enduserRealm}#/profile`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const userPassword = 'Pass1234!';
    let userId;
    let defaultTheme = '';
    let testThemeName = '';

    before(() => {
      cy.loginAsAdmin().then(() => {
        getThemesList().then((list) => {
          // Gets the Default Theme from the list of themes so it can be set back as the Realm default at the end of the test
          defaultTheme = find(list.body.realm[loginRealm], { isDefault: true }).name;
        });
      });

      // Create testing IDM enduser
      cy.log('Create new IDM Enduser').then(() => {
        createIDMUser({
          userName,
          password: userPassword,
          givenName: userName,
          sn: 'test',
        }).then((result) => {
          expect(result.status).to.equal(201);
          userId = result.body._id;

          cy.logout();
        });
      });
    });

    retryableBeforeEach(() => {
      // Generate unique test Theme name
      testThemeName = `test_theme_${random(Number.MAX_SAFE_INTEGER)}`;

      cy.loginAsAdmin().then(() => {
        cy.visit(hostedPagesUrl);
        createNewTheme(testThemeName);
      });
    });

    afterEach(() => {
      // Clear cookies
      cy.logout();

      // Login as admin, set the Default Theme back as the Realm default and delete the test Theme
      cy.loginAsAdmin().then(() => {
        cy.visit(hostedPagesUrl);
        // Wait for the Themes table to load
        cy.findByRole('heading', { name: 'Hosted Pages' }).should('be.visible');
        cy.findByRole('button', { name: 'New Theme', timeout: 10000 }).should('be.visible');

        setThemeAsDefault(defaultTheme);
        deleteTheme(testThemeName);
      });
    });

    after(() => {
      // Clear cookies
      cy.logout();

      // Login as admin and delete testing IDM enduser
      cy.loginAsAdmin().then(() => {
        deleteIDMUser(userId);
      });
    });

    it('Should change enduser colors', () => {
      // Set the Theme color data for the test
      changeColorValue(/^Link Color/, '16FF96');
      changeColorValue(/^Link Hover Color/, '123123');
      cy.findByRole('tab', { name: 'Account Pages' }).click();
      cy.findByRole('heading', { name: 'Page Styles' }).click();
      changeColorValue(/^Page Background Color/, 'FFFFFF');
      cy.findByRole('heading', { name: 'Navigation' }).click();
      changeColorValue(/^Navigation Active Color/, '123123');
      changeColorValue(/^Navigation Active Text Color/, '16FF96');

      // Enable Security Questions option for Enduser UI
      cy.findByRole('tab', { name: 'Account Pages' }).click();
      cy.findByRole('tab', { name: 'Layout' }).click();
      cy.findByRole('checkbox', { name: 'Security Questions' }).scrollIntoView().should('not.be.checked').click({ force: true });

      // Save the Theme and set it as the Realm Default
      saveThemeEdit();
      setThemeAsDefault(testThemeName);

      // Logout admin
      cy.logout();
      // Log in to the Enduser UI
      cy.loginAsEnduser(userName, userPassword);

      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Visit Enduser Profile page
      cy.visit(enduserProfileUrl);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check that the Theme is correctly applied
      cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
      cy.findByRole('link', { name: 'Reset Security Questions' }).should('have.css', 'color', 'rgb(22, 255, 150)');
      cy.get('#app .router-link-active').should('have.css', 'background-color', 'rgb(18, 49, 35)');
    });

    it('Should change profile page logo', () => {
      // Set the Theme logo data for the test
      cy.findByRole('tab', { name: 'Account Pages' }).click();
      cy.findByRole('tab', { name: 'Logo' }).click();
      cy.findByTestId('logo-profile-preview').click();
      cy.findByLabelText('Logo URL')
        .clear()
        .type('h');
      cy.findAllByTestId('in-situ-logo-preview')
        .eq(0)
        .should('have.attr', 'src')
        .should('include', 'h');
      cy.findByLabelText('Logo URL')
        .type('ttps://mods.vorondesign.com/files/FDqscS50BRdqtEhUK1U9hA/%2FVPlainL%2F1ColorLayer%2FVDesignPlainLorig.png');
      cy.findAllByLabelText('Alt Text')
        .eq(0)
        .clear()
        .type('alt');
      cy.findByRole('button', { name: 'Update' }).click();

      // Save the Theme and set it as the Realm Default
      saveThemeEdit();
      setThemeAsDefault(testThemeName);

      // Logout admin
      cy.logout();
      // Log in to the Enduser UI
      cy.loginAsEnduser(userName, userPassword);

      // Check that the Theme is correctly applied
      cy.get('div.ping-logo:visible')
        .should('have.css', 'background-image', 'url("https://mods.vorondesign.com/files/FDqscS50BRdqtEhUK1U9hA/%2FVPlainL%2F1ColorLayer%2FVDesignPlainLorig.png")');
    });

    it('Should toggle profile pieces', () => {
      // Set the Theme data for the test
      cy.findByRole('tab', { name: 'Account Pages' }).click();
      cy.findByRole('tab', { name: 'Layout' }).click();
      cy.findByRole('checkbox', { name: 'Password' }).scrollIntoView().should('be.checked').click({ force: true });
      cy.findByRole('checkbox', { name: '2-Step Verification' }).scrollIntoView().should('be.checked').click({ force: true });
      cy.findByRole('checkbox', { name: 'Security Questions' }).scrollIntoView().should('not.be.checked').click({ force: true });

      // Save the Theme and set it as the Realm Default
      saveThemeEdit();
      setThemeAsDefault(testThemeName);

      // Logout admin
      cy.logout();
      // Log in to the Enduser UI
      cy.loginAsEnduser(userName, userPassword);

      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Visit Enduser Profile page
      cy.visit(enduserProfileUrl);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check that the Theme is correctly applied
      // Verify personal information, password row, and 2-step verification row do not appear
      cy.findByRole('heading', { name: 'Sign-in & Security' }).should('exist');
      cy.findByRole('heading', { name: 'Password' }).should('not.exist');
      cy.findByRole('heading', { name: '2-Step Verification' }).should('not.exist');
      // Verify username and Security Questions rows do appear
      cy.findByRole('heading', { name: 'Username' }).should('exist');
      cy.findByRole('heading', { name: 'Security Questions' }).should('exist');
    });

    it('Should change login/profile favicon', () => {
      // Set the Theme favicon data for the test
      cy.findByRole('tab', { name: 'Favicon' }).click();
      cy.findByTestId('favicon-preview').should('be.visible').click();
      cy.findByLabelText('Favicon URL')
        .clear()
        .type('h');
      cy.findByTestId('favicon-preview')
        .should('have.attr', 'src')
        .should('include', 'h');
      cy.findByLabelText('Favicon URL')
        .type('ttps://www.favicon.cc/logo3d/850851.png');
      cy.findByRole('button', { name: 'Update' }).click();

      // Save the Theme and set it as the Realm Default
      saveThemeEdit();
      setThemeAsDefault(testThemeName);

      // Logout admin
      cy.logout();

      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Visit Default Journey
      cy.visit(Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha#/` : `${Cypress.config().baseUrl}/enduser/`);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check Login page has proper favicon
      cy.findByTestId('favicon').should('have.attr', 'href').and('include', 'https://www.favicon.cc/logo3d/850851.png');

      // Log in to the Enduser UI
      cy.loginAsEnduser(userName, userPassword);

      // Ensure enduser has proper favicon
      cy.findByTestId('favicon').should('have.attr', 'href').and('include', 'https://www.favicon.cc/logo3d/850851.png');
    });
  });
});
