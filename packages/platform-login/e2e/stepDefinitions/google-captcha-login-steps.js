/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  Given, When, Then,
} from '@badeball/cypress-cucumber-preprocessor';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import generateEnduserData from '../utils/endUserData';

let locationUrl;

const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';

// resolve captcha
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

// fill login form
function fillLoginForm(username, password) {
  cy.intercept('GET', '**/recaptcha/api2/**').as('getRecaptcha');
  cy.wait('@getRecaptcha').then((recaptcha) => {
    expect(recaptcha.response.statusCode).to.equal(200);
  });

  cy.findByLabelText(/User Name/i, { timeout: 20000 }).should('be.visible')
    .type(username, { force: true })
    .should('have.value', username);
  cy.findAllByLabelText(/Password/i).first()
    .type(password, { force: true })
    .should('have.value', password);
}

// URL location
function setLocationUrl(journey) {
  return `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=${journey}`;
}

// Setup before running Feature file
before(() => {
  if (Cypress.spec.relative.includes('google-captcha-login.feature')) {
    cy.importTreesViaAPI(['QA-Google_Captcha_Login_Default.json', 'QA-Google_Captcha_Login_Theatre_mode.json']).then(() => {
      const { userName, userPassword, userSN } = generateEnduserData();

      createIDMUser({
        userName,
        password: userPassword,
        givenName: userName,
        sn: userSN,
      }).then((result) => {
        expect(result.status).to.equal(201);
        Cypress.env('endUserName', userName);
        Cypress.env('endUserFirstName', userName);
        Cypress.env('endUserLastName', userSN);
        Cypress.env('endUserPassword', userPassword);
        Cypress.env('endUserId', result.body._id);
      });
    });
  }
});

// Cleanup after running Feature file
after(() => {
  // Login as admin
  if (Cypress.spec.relative.includes('google-captcha-login.feature')) {
    cy.deleteTreesViaAPI(['QA-Google_Captcha_Login_Default.json', 'QA-Google_Captcha_Login_Theatre_mode.json']).then(() => {
      deleteIDMUser(Cypress.env('endUserId'));
    });
  }
});

// Cucumber steps
Given('the user navigates to the captcha End User login page', () => {
  locationUrl = setLocationUrl('QA-Google_Captcha_Login_Default');
  cy.visit(locationUrl);
});

When('the user fills in the login form with correct credentials', () => {
  fillLoginForm(Cypress.env('endUserName'), Cypress.env('endUserPassword'));
});

When('the user does not solve the captcha', () => {
  // No captcha resolved
});

When('the user fills in the login form with an incorrect username', () => {
  fillLoginForm('wrongUsername', Cypress.env('endUserPassword'));
});

When('the user fills in the login form with an incorrect password', () => {
  fillLoginForm(Cypress.env('endUserName'), 'wrongPassword');
});

When('the user solves the captcha', () => {
  resolveCaptcha();
});

Then('the "Next" button should be disabled', () => {
  cy.findByRole('button', { name: 'Next' }).should('be.disabled');
});

Then('the "Next" button should be enabled', () => {
  cy.findByRole('button', { name: 'Next' })
    .should('be.enabled', { timeout: 5000 });
});

Then('the user should be logged in and see the dashboard', () => {
  cy.findByTestId('dashboard-welcome-greeting', { timeout: 15000 })
    .should('contain', Cypress.env('endUserName'));
});

Given('the user navigates to the login page in Theatre Mode', () => {
  locationUrl = setLocationUrl('QA-Google_Captcha_Login_Theatre_mode');
  cy.visit(locationUrl);
});
