/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createIDMUser } from '../api/managedApi.e2e';
import { setBaseTheme } from '../api/themeApi.e2e';

function changeColour(name, value) {
  cy.findByRole('button', { name }).scrollIntoView().click();
  cy.findByRole('tooltip').findByLabelText('hex').clear().type(value);
  cy.findByRole('tab', { name: 'Styles' }).click({ force: true });
  cy.findByRole('tooltip').should('not.exist', { timeout: 15000 });
}

describe('Enduser Theming', () => {
  const platformLoginUrl = `${Cypress.config().baseUrl}/platform/`;
  const locationUrl = `${Cypress.config().baseUrl}/platform/?realm=root#/hosted-pages`;
  let enduserUserName = '';
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');

  before(() => {
    createIDMUser().then((results) => {
      enduserUserName = results.body.userName;
    });
  });

  it('should change enduser colors', () => {
    cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
    cy.login(adminUserName, adminPassword, platformLoginUrl).then(() => {
      cy.wait('@getAccessToken').then(({ response }) => {
        const accessToken = response.body.access_token;
        setBaseTheme(accessToken);
      });
    });
    cy.visit(locationUrl);
    cy.findByRole('cell', { name: 'Starter Theme' }).click();

    changeColour(/^Link Color/, '16FF96');
    changeColour(/^Link Active Color/, '123123');
    changeColour(/^Enduser Background Color/, 'FFFFFF');
    changeColour(/^Menu Active Color/, '123123');
    changeColour(/^Menu Active Text Color/, '16FF96');

    cy.get('button.btn-primary:visible').contains('Save').scrollIntoView().click();
    cy.logout();
    cy.login(enduserUserName);
    cy.visit(`${Cypress.config().baseUrl}/enduser/?realm=root#/profile`);
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.findByRole('link', { name: 'Reset Security Questions' }).should('have.css', 'color', 'rgb(22, 255, 150)');
    cy.get('#app .router-link-active').should('have.css', 'background-color', 'rgb(18, 49, 35)');
  });

  it('should change profile page logo', () => {
    cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
    cy.login(adminUserName, adminPassword, platformLoginUrl).then(() => {
      cy.wait('@getAccessToken').then(({ response }) => {
        const accessToken = response.body.access_token;
        setBaseTheme(accessToken);
      });
    });
    cy.visit(locationUrl);
    cy.findByRole('cell', { name: 'Starter Theme' }).click();
    cy.findByRole('tab', { name: 'Logos' }).click();
    cy.findAllByPlaceholderText('Logo URL')
      .eq(1)
      .clear()
      .type('h');
    cy.findByTestId('in-situ-logo-preview')
      .should('have.attr', 'src')
      .should('include', 'h');
    cy.findAllByPlaceholderText('Logo URL')
      .eq(1)
      .type('ttps://www.logosurfer.com/wp-content/uploads/2018/03/quicken-loans-logo_0.png');
    cy.findAllByPlaceholderText('Alt Text')
      .eq(1)
      .clear()
      .type('alt');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.logout();
    cy.login(enduserUserName);
    cy.get('div.fr-logo:visible')
      .should('have.css', 'background-image', 'url("https://www.logosurfer.com/wp-content/uploads/2018/03/quicken-loans-logo_0.png")');
  });

  it('should toggle profile pieces', () => {
    cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
    cy.login(adminUserName, adminPassword, platformLoginUrl).then(() => {
      cy.wait('@getAccessToken').then(({ response }) => {
        const accessToken = response.body.access_token;
        setBaseTheme(accessToken);
      });
    });
    cy.visit(locationUrl);
    cy.findByRole('cell', { name: 'Starter Theme' }).click();
    cy.findByRole('tab', { name: 'Layout' }).click();
    cy.findByRole('button', { name: 'Account Page' }).click();
    cy.findByRole('checkbox', { name: 'Password' }).click({ force: true });
    cy.findByRole('checkbox', { name: '2-Step Verification' }).click({ force: true });
    cy.findByRole('button', { name: 'Save' }).click();
    cy.logout();
    cy.login(enduserUserName);
    cy.visit(`${Cypress.config().baseUrl}/enduser/?realm=root#/profile`);
    // verify personal information, password row, and 2-step verification row do not appear
    cy.findByRole('heading', { name: 'Sign-in & Security' }).should('exist');
    cy.findByRole('heading', { name: 'Password' }).should('not.exist');
    cy.findByRole('heading', { name: '2-Step Verification' }).should('not.exist');
    // verify username and Security Questions rows do appear
    cy.findByRole('heading', { name: 'Username' }).should('exist');
    cy.findByRole('heading', { name: 'Security Questions' }).should('exist');
    // reset theme to keep environment clean
    cy.logout();
    cy.login(adminUserName, adminPassword, platformLoginUrl).then(() => {
      cy.wait('@getAccessToken').then(({ response }) => {
        const accessToken = response.body.access_token;
        setBaseTheme(accessToken);
      });
    });
  });

  it('should change login/profile favicon', () => {
    cy.login(adminUserName, adminPassword, platformLoginUrl);

    cy.visit(locationUrl);
    cy.findByRole('cell', { name: 'Starter Theme' }).click();
    cy.findByRole('tab', { name: 'Logos' }).click();
    cy.findByPlaceholderText('Favicon')
      .clear()
      .type('h');
    cy.findByTestId('favicon-preview')
      .should('have.attr', 'src')
      .should('include', 'h');
    cy.findByPlaceholderText('Favicon')
      .type('ttps://www.forgerock.com//themes/custom/forgerock/favicon.ico');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.logout();
    cy.visit(locationUrl);
    // ensure login has proper favicon
    cy.visit(`${Cypress.config().baseUrl}/enduser/`);
    cy.findByTestId('favicon').should('have.attr', 'href').should('include', 'https://www.forgerock.com//themes/custom/forgerock/favicon.ico');

    // ensure enduser has proper favicon
    cy.login(enduserUserName);
    cy.findByTestId('favicon').should('have.attr', 'href').should('include', 'https://www.forgerock.com//themes/custom/forgerock/favicon.ico');
  });

  it('should delete test user', () => {
    cy.login(enduserUserName);
    const permanentlyDeleteMessage = 'Are you sure you want to permanently delete your account data?';
    cy.get('[href="#/profile"]:first').click();
    cy.get('h5.mb-0:last')
      .should('exist')
      .should('contain', 'Delete Account')
      .click();
    cy.get('button.btn-danger:last')
      .should('exist')
      .click();
    cy.get('div.modal-body').should('contain', permanentlyDeleteMessage);
    cy.get('footer.modal-footer').within(() => {
      cy.get('button.btn-danger')
        .should('be.enabled')
        .should('contain', 'Delete Account')
        .click();
    });
  });
});
