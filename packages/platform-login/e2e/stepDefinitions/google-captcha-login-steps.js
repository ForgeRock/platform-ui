/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  Given, When, Then,
} from '@badeball/cypress-cucumber-preprocessor';
import { random } from 'lodash';
import { createIDMUser } from '../api/managedApi.e2e';

let userName;
const userPassword = 'Test1234!';
let journeyName;
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
      cy.logout();
    });
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

// Cucumber steps

Given('the user has created a new End User with correct credentials', () => {
  journeyName = 'QA-Google_Captcha_Login_Default';
  const journey = `${journeyName}.json`;
  // Import testing Journey
  cy.importTreesViaAPI([journey]);
  createUser();
});

Given('the user navigates to the captcha End User login page', () => {
  journeyName = 'QA-Google_Captcha_Login_Default';
  locationUrl = setLocationUrl(journeyName);
  cy.visit(locationUrl);
});

When('the user fills in the login form with correct credentials', () => {
  fillLoginForm(userName, userPassword);
});

When('the user does not solve the captcha', () => {
  // No captcha resolved
});

When('the user fills in the login form with an incorrect username', () => {
  fillLoginForm('wrongUsername', userPassword);
});

When('the user fills in the login form with an incorrect password', () => {
  fillLoginForm(userName, 'wrongPassword');
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
    .should('contain', userName);
});

Given('the user has created a new End User in Theatre Mode', () => {
  journeyName = 'QA-Google_Captcha_Login_Theatre_mode';
  const journey = `${journeyName}.json`;
  // Import testing Journey
  cy.importTreesViaAPI([journey]);
  createUser();
});

Given('the user navigates to the login page in Theatre Mode', () => {
  locationUrl = setLocationUrl('QA-Google_Captcha_Login_Theatre_mode');
  cy.visit(locationUrl);
});
