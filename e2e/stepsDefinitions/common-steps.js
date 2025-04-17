/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { random } from 'lodash';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import generateRandomEndUser from '../utils/endUserData';
import { selectDropdownOption } from '../utils/uiUtils';
import { generateJourneyURL } from '../utils/journeyUtils';

Given('admin logs into the tenant', () => {
  cy.loginAsAdmin();
});

Given('user navigates to {journey} journey', (journeyName) => {
  const url = generateJourneyURL(journeyName);
  cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  cy.visit(url);
  cy.wait('@getTheme', { timeout: 10000 });
  // Added for tests stability
  // TODO: Review a better way to improve stability
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
});

Given('admin Login into the tenant', () => {
  cy.loginAsAdmin();
});

/**
 * Creates an end user account if does not exist with random credentials, stores the credentials in the environment variables
 */
Given('enduser account is created via API', () => {
  if (!Cypress.env('endUserId')) {
    const endUser = generateRandomEndUser();
    if (!Cypress.env('ACCESS_TOKEN')) {
      cy.loginAsAdmin();
    }
    cy.log(`Creating new IDM enduser ${endUser.userName}`).then(() => {
      createIDMUser({
        userName: endUser.username,
        password: endUser.password,
        givenName: endUser.firstName,
        sn: endUser.lastName,
        mail: endUser.emailAddress,
      }).then((result) => {
        expect(result.status).to.equal(201);
        Cypress.env('endUserName', endUser.username);
        Cypress.env('endUserFirstName', endUser.firstName);
        Cypress.env('endUserLastName', endUser.lastName);
        Cypress.env('endUserPassword', endUser.password);
        Cypress.env('endUserId', result.body._id);
      });
    });
  }
});

Given('admin/enduser is logged out', () => {
  cy.logout();
  Cypress.env('ACCESS_TOKEN', '');
});

Given('admin navigates to {page} page', (page) => {
  cy.navigateToPage(page);
});

Given('admin navigates to login page', () => {
  cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
});

Given('admin navigates to {string} page url', (page) => {
  cy.intercept('GET', '/am/json/serverinfo/*').as('getServerInfo');
  cy.visit(`${Cypress.config().baseUrl}${page}`);
  cy.wait('@getServerInfo');
});

When('user clicks on {string} cell on table', (cellToClick) => {
  cy.findAllByRole('cell', { name: Cypress.env(cellToClick) ? Cypress.env(cellToClick) : cellToClick }).eq(0).click();
});

When('user searches {string} on search box', (searchString) => {
  cy.findByRole('searchbox', { name: 'Search' }).clear().type(`${Cypress.env(searchString) ? Cypress.env(searchString) : searchString}{enter}`);
});

When('user types {string} in the field {string}', (value, field) => {
  cy.findByLabelText(field).clear().type(value);
});

When('user types the stored value of {string} in {string} field', (storedDataName, fieldName) => {
  cy.findByLabelText(fieldName).clear().type(Cypress.env(storedDataName));
});

When('user waits for themerealm request', () => {
  cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  cy.wait('@getTheme', { timeout: 10000 });
});

When('user fills registration form with following data', (dataTable) => {
  dataTable.hashes().forEach((row) => {
    const stringToType = row.Value.replace('RandomNumberReplace', random(Number.MAX_SAFE_INTEGER));
    let endUserProperty = '';
    if (row.Field === 'Username') {
      endUserProperty = 'endUserName';
    } else {
      const fieldWithoutSpaces = row.Field.replace(/\s/g, '');
      endUserProperty = `endUser${fieldWithoutSpaces.charAt(0).toUpperCase()}${fieldWithoutSpaces.slice(1)}`;
    }
    Cypress.env(endUserProperty, stringToType);
    cy.findByLabelText(row.Field).clear().type(stringToType);
  });
});

When('user selects {string} option on dropdown', (optionName) => {
  selectDropdownOption(optionName);
});

When('clicks on {string} tab', (page) => {
  cy.findByRole('link', { name: page }).click();
});

When('user reloads the page', () => {
  cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  cy.reload();
  cy.wait('@getTheme', { timeout: 10000 });
});

When('user clicks on {string} button in {string} modal', (button, modal) => {
  cy.findByRole('dialog', { name: modal }).within(() => {
    cy.findByRole('button', { name: button }).click();
  });
});

When('user clicks on {string} button', (button) => {
  cy.findByRole('button', { name: button }).click();
});

When('user clicks on {string} link', (link) => {
  cy.findByRole('link', { name: link }).click();
});

Then('{string} button is enabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.enabled');
});

Then('{string} button is disabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.disabled');
});

Then('{string} modal no longer exists', (modal) => {
  cy.findByRole('dialog', { name: modal })
    .should('not.exist');
});

Then('notification is displayed with text {string}', (message) => {
  cy.findByRole('alert', { name: message }).should('be.visible');
});

Then('{string} error message is displayed', (message) => {
  cy.findAllByRole('alert').contains(message).should('be.visible');
});

/**
 * Deletes the end user account created in the previous step
 */
Then('enduser account is deleted via API', () => {
  if (!Cypress.env('ACCESS_TOKEN')) {
    cy.loginAsAdmin();
  }

  deleteIDMUser(Cypress.env('endUserId'));
  Cypress.env('endUserName', '');
  Cypress.env('endUserFirstName', '');
  Cypress.env('endUserLastName', '');
  Cypress.env('endUserPassword', '');
  Cypress.env('endUserId', '');
});

When('the user clears the {string} field', (field) => {
  cy.findByLabelText(field)
    .clear();
});

Then('{string} modal is displayed/opened', (modal) => {
  cy.findByRole('dialog', { name: modal })
    .should('exist');
});

Then('{string} modal is displayed after user is iddle for {int} seconds', (modal, seconds) => {
  cy.findByRole('dialog', { name: modal, timeout: seconds * 1000 })
    .should('be.visible');
});

When('the message {string} should be present', (message) => {
  cy.findByText(message)
    .should('be.visible');
});

When('{string} option should be present', (option) => {
  cy.findByText(option)
    .should('be.visible');
});

Then('page url contains {string}', (url) => {
  cy.url().should('include', url);
});

Then('page url does not contain {string}', (url) => {
  cy.url().should('not.include', url);
});

Then('{string} field has {string} validation error', (field, validationError) => {
  cy.get(`[label="${field}"]`).find('.error-message').should('have.text', validationError);
});

Then('{string} validation error doesn\'t exist', (validationError) => {
  cy.findByText(validationError).should('not.exist');
});

Then('{string} field doesn\'t have any validation error', (field) => {
  cy.get(`[label="${field}"]`).find('.error-message').should('not.exist');
});

/**
 * Deletes the end user account created in the previous step
 */
Then('enduser account is deleted via API', () => {
  if (!Cypress.env('ACCESS_TOKEN')) {
    cy.loginAsAdmin();
  }

  deleteIDMUser(Cypress.env('endUserId'));
});

Then('enduser dashboard is loaded with enduser data', () => {
  cy.findAllByRole('heading', { timeout: 10000 }).contains(`Hello, ${Cypress.env('endUserFirstName')} ${Cypress.env('endUserLastName')}`).should('be.visible');
});

Then('the option {string} is visible', (optionName) => {
  cy.findByRole('option', { name: optionName }).should('be.visible');
});

Then('the option {string} does not exist', (optionName) => {
  cy.findByRole('option', { name: optionName }).should('not.exist');
});

Then('fields are visible', (datatable) => {
  datatable.hashes().forEach((row) => {
    cy.findByLabelText(row.fieldName).should('be.visible');
  });
});

Then('fields are not visible', (datatable) => {
  datatable.hashes().forEach((row) => {
    cy.findByLabelText(row.fieldName).should('not.exist');
  });
});

Then('text {string} does not exist', (text) => {
  cy.findByText(text).should('not.exist');
});

Then('the value of the {string} field is {string}', (fieldName, expectedValue) => {
  cy.findByLabelText(fieldName).should('have.value', expectedValue);
});

Then('page title is {string}', (title) => {
  // TODO: Remove this big timeout after Themes performance is resolved (default 5s should be enough)
  cy.findByRole('heading', { name: title, timeout: 10000 })
    .should('be.visible');
});

Then('page title is {string} after user is idle for {int} seconds', (title, seconds) => {
  cy.findByRole('heading', { name: title, timeout: seconds * 1000 })
    .should('be.visible');
});
