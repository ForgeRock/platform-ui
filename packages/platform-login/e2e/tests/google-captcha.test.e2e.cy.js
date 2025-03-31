/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';

filterTests(['@forgeops', '@cloud'], () => {
  const loginFailedErrorMessage = 'Login failure';
  const userPassword = 'Rg_GRg9k&e';
  const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
  let journeyName;
  let userName;
  let userId;
  let locationUrl;

  function resolveCaptcha() {
    cy.get('iframe')
      .first()
      .then((recaptchaIframe) => {
        const iframeBody = recaptchaIframe.contents();
        cy.wrap(iframeBody)
          .find('.recaptcha-checkbox-border', { timeout: 10000 }).as('recaptchaCheckbox');
        cy.get('@recaptchaCheckbox')
          .should('be.visible')
          .click();
      });
  }

  function createUser() {
    // Create a random username
    userName = `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`;
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
  }

  function fillLoginForm(username, password) {
    // Wait for the recaptcha to load
    cy.intercept('GET', '**/recaptcha/api2/**').as('getRecaptcha');
    cy.wait('@getRecaptcha').then((recaptcha) => {
      expect(recaptcha.response.statusCode).to.equal(200);
    });

    // Fill in credetials
    cy.findByLabelText(/User Name/i, { timeout: 20000 }).should('be.visible')
      .type(username, { force: true })
      .should('have.value', username);
    cy.findAllByLabelText(/Password/i).first()
      .type(password, { force: true })
      .should('have.value', password);
  }

  function loginEnduserWithCaptcha() {
    // Fill in credetials with correct user data
    fillLoginForm(userName, userPassword);

    // Resolve the Captcha
    resolveCaptcha();

    // Click Next button
    cy.findByRole('button', { name: 'Next' }).click();
  }

  function setLocationUrl(journey) {
    return `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=${journey}`;
  }

  describe('Google Captcha Login Default Theme', () => {
    before(() => {
      journeyName = 'QA-Google_Captcha_Login_Default';
      const journey = `${journeyName}.json`;
      // Import testing Journey
      cy.importTreesViaAPI([journey]);
      createUser();
    });

    retryableBeforeEach(() => {
      locationUrl = setLocationUrl(journeyName);
      cy.visit(locationUrl);
    });

    after(() => {
      // Login as admin, delete imported testing Journey & delete testing IDM enduser
      cy.deleteTreesViaAPI([`${journeyName}.json`]).then(() => {
        deleteIDMUser(userId);
      });
    });

    it('Cant login with correct credentials but Captcha unresolved', () => {
      // Fill in credetials
      fillLoginForm(userName, userPassword);

      // Click Next button
      cy.findByRole('button', { name: 'Next' })
        .should('be.visible')
        .should('be.disabled');
    });

    //  Disabled test for firefox browser due to Cypress limitation when interacting with iframes described in https://docs.cypress.io/guides/guides/web-security
    it('Cant login with wrong username and Captcha resolved', { browser: '!firefox' }, () => {
      // Type an incorrect username
      fillLoginForm('wrongUsername', userPassword);

      // Resolve the CAPTCHA
      resolveCaptcha();

      // Click Next button
      cy.findByRole('button', { name: 'Next' })
        .should('be.visible').click();

      // Check if the error message is displayed
      cy.findAllByRole('alert').contains(loginFailedErrorMessage);
    });

    //  Disabled test for firefox browser due to Cypress limitation when interacting with iframes described in https://docs.cypress.io/guides/guides/web-security
    it('Cant login with wrong password and Captcha resolved', { browser: '!firefox' }, () => {
      // Type an incorrect password
      fillLoginForm(userName, 'wrongPassword');

      // Resolve the CAPTCHA
      resolveCaptcha();

      // Click Next button
      cy.findByRole('button', { name: 'Next' })
        .should('be.visible').click();

      // Check if the error message is displayed
      cy.findAllByRole('alert').contains(loginFailedErrorMessage);
    });

    // Disabled test for firefox browser due to Cypress limitation when interacting with iframes described in https://docs.cypress.io/guides/guides/web-security
    it('Login with correct credentials and captcha resolved', { browser: '!firefox' }, () => {
      // Login as enduser
      loginEnduserWithCaptcha();

      // Check if the user is logged in
      cy.findByTestId('dashboard-welcome-greeting', { timeout: 15000 })
        .should('contain', userName);
    });
  });

  // Disabled test for firefox browser due to Cypress limitation when interacting with iframes described in https://docs.cypress.io/guides/guides/web-security
  describe('Google Captcha Login Theatre Mode', { browser: '!firefox' }, () => {
    before(() => {
      journeyName = 'QA-Google_Captcha_Login_Theatre_mode';
      const journey = `${journeyName}.json`;
      // Import testing Journey
      cy.importTreesViaAPI([journey]);
      createUser();
    });

    retryableBeforeEach(() => {
      locationUrl = setLocationUrl(journeyName);
      cy.visit(locationUrl);
    });

    after(() => {
      // Login as admin, delete imported testing Journey & delete testing IDM enduser
      cy.deleteTreesViaAPI([`${journeyName}.json`]).then(() => {
        deleteIDMUser(userId);
      });
    });

    it('Login with correct credentials and captcha resolved Theatre Mode', () => {
      // Login as enduser
      loginEnduserWithCaptcha();

      // Check if the user is logged in
      cy.findByTestId('dashboard-welcome-greeting', { timeout: 15000 })
        .should('contain', userName);
    });
  });
});
