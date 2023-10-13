/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import { setBaseTheme } from '../api/themeApi.e2e';

function changeColour(name, value) {
  cy.findByRole('button', { name }).scrollIntoView().click();
  cy.findByRole('tooltip').findByLabelText('hex').clear().type(value);
  cy.findByRole('tab', { name: 'Styles' }).click({ force: true });
  cy.findByRole('tooltip').should('not.exist', { timeout: 15000 });
}

const enduserRealm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';

filterTests(['forgeops', 'cloud'], () => {
  describe('Enduser Theming', () => {
    let enduserUserName;
    let enduserUserId;

    retryableBeforeEach(() => {
      // Log in to the admin console to get an admin access token
      cy.loginAsAdmin().then(() => {
        // Create the user for the test
        createIDMUser().then(({ body: { userName, _id } }) => {
          enduserUserName = userName;
          enduserUserId = _id;

          // Set the base theme to alter during the test
          setBaseTheme().then(() => {
            // Visit the edit page for the theme used in the test
            cy.visit(`${Cypress.config().baseUrl}/platform/?realm=${enduserRealm}#/hosted-pages/Starter%20Theme`);
            // Verify that the title is present on the page, this step depends on a request that is executed in the background and the timeout is required.
            cy.findByRole('heading', { name: 'Starter Theme', timeout: 10000 }).should('exist');
          });
        });
      });
    });

    after(() => {
      // Reset the theme to the base theme
      setBaseTheme();
    });

    it('should change enduser colors', () => {
      // Set the theme data for the test
      changeColour(/^Link Color/, '16FF96');
      changeColour(/^Link Hover Color/, '123123');
      cy.findByRole('tab', { name: 'Account Pages' }).click();
      cy.findByRole('heading', { name: 'Page Styles' }).click();
      changeColour(/^Page Background Color/, 'FFFFFF');
      cy.findByRole('heading', { name: 'Navigation' }).click();
      changeColour(/^Navigation Active Color/, '123123');
      changeColour(/^Navigation Active Text Color/, '16FF96');

      cy.findByRole('button', { name: 'Save' }).click();

      // Log in to the enduser UI and check that the theme has been applied
      cy.logout();
      cy.loginAsEnduser(enduserUserName);
      cy.visit(`${Cypress.config().baseUrl}/enduser/?realm=${enduserRealm}#/profile`);
      cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
      cy.findByRole('link', { name: 'Reset Security Questions' }).should('have.css', 'color', 'rgb(22, 255, 150)');
      cy.get('#app .router-link-active').should('have.css', 'background-color', 'rgb(18, 49, 35)');

      // Clean up the test user
      deleteIDMUser(enduserUserId);
    });

    it('should change profile page logo', () => {
      // Set the theme data for the test
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
        .type('ttps://www.logosurfer.com/wp-content/uploads/2018/03/quicken-loans-logo_0.png');
      cy.findAllByLabelText('Alt Text')
        .eq(0)
        .clear()
        .type('alt');
      cy.findByRole('button', { name: 'Update' }).click();
      cy.findByRole('button', { name: 'Save' }).click();

      // Log in to the enduser UI and check that the theme has been applied
      cy.logout();
      cy.loginAsEnduser(enduserUserName);
      cy.get('div.fr-logo:visible')
        .should('have.css', 'background-image', 'url("https://www.logosurfer.com/wp-content/uploads/2018/03/quicken-loans-logo_0.png")');

      // Clean up the test user
      deleteIDMUser(enduserUserId);
    });

    it('should toggle profile pieces', () => {
      // Set the theme data for the test
      cy.findByRole('tab', { name: 'Account Pages' }).click();
      cy.findByRole('tab', { name: 'Layout' }).click();
      cy.findByRole('checkbox', { name: 'Password' }).click({ force: true });
      cy.findByRole('checkbox', { name: '2-Step Verification' }).click({ force: true });
      cy.findByRole('button', { name: 'Save' }).click();

      // Log in to the enduser UI and check that the theme has been applied
      cy.logout();
      cy.loginAsEnduser(enduserUserName);
      cy.visit(`${Cypress.config().baseUrl}/enduser/?realm=${enduserRealm}#/profile`);
      // verify personal information, password row, and 2-step verification row do not appear
      cy.findByRole('heading', { name: 'Sign-in & Security' }).should('exist');
      cy.findByRole('heading', { name: 'Password' }).should('not.exist');
      cy.findByRole('heading', { name: '2-Step Verification' }).should('not.exist');
      // verify username and Security Questions rows do appear
      cy.findByRole('heading', { name: 'Username' }).should('exist');
      cy.findByRole('heading', { name: 'Security Questions' }).should('exist');

      // Clean up the test user
      deleteIDMUser(enduserUserId);
    });

    it('should change login/profile favicon', () => {
      // Set the theme data for the test
      cy.findByRole('tab', { name: 'Favicon' }).click();
      cy.findByRole('button', { name: 'Logo' }).click();
      cy.findByLabelText('Favicon URL')
        .clear()
        .type('h');
      cy.findByTestId('favicon-preview')
        .should('have.attr', 'src')
        .should('include', 'h');
      cy.findByLabelText('Favicon URL')
        .type('ttps://www.forgerock.com/themes/custom/forgerock/favicon.ico');
      cy.findByRole('button', { name: 'Update' }).click();
      cy.findByRole('button', { name: 'Save' }).click();

      // Log in to the enduser UI and check that the theme has been applied
      cy.logout();
      cy.visit(Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha#/` : `${Cypress.config().baseUrl}/enduser/`);
      cy.findByTestId('favicon').should('have.attr', 'href').and('include', 'https://www.forgerock.com/themes/custom/forgerock/favicon.ico');

      // ensure enduser has proper favicon
      cy.loginAsEnduser(enduserUserName);
      cy.findByTestId('favicon').should('have.attr', 'href').and('include', 'https://www.forgerock.com/themes/custom/forgerock/favicon.ico');

      // Clean up the test user
      deleteIDMUser(enduserUserId);
    });
  });
});
