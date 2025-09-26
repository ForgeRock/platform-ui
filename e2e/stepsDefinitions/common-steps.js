/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { random } from 'lodash';
import hexToRgb from '@e2e/utils/themeutils';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import generateRandomEndUser from '../utils/endUserData';
import { selectDropdownOption, typeIntoField } from '../utils/uiUtils';
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

When('user fills the following fields', (dataTable) => {
  dataTable.hashes().forEach((row) => {
    typeIntoField(row.Field, row.Value);
  });
});

When('user clicks on the item {string} from the current table', (itemName) => {
  cy.findAllByRole('cell', { name: itemName }).click();
});

When('user navigates back with browser Back arrow', () => {
  cy.go('back');
});

When('user clicks on {string} cell on table', (cellToClick) => {
  cy.findAllByRole('cell', { name: Cypress.env(cellToClick) ? Cypress.env(cellToClick) : cellToClick }).eq(0).click();
});

When('user searches {string} on search box', (searchString) => {
  cy.findByRole('searchbox', { name: 'Search' }).clear().type(`${Cypress.env(searchString) ? Cypress.env(searchString) : searchString}{enter}`);
});

When('user focus field {string}', (field) => {
  cy.findByLabelText(field).focus();
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

When('user selects {string} option on dropdown {string}', (option, dropdown) => {
  cy.findByRole('combobox', { name: dropdown }).click();
  selectDropdownOption(option);
});

When('user reloads the page', () => {
  cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  cy.reload();
  cy.wait('@getTheme', { timeout: 10000 });
});

When('user reloads journey page', () => {
  cy.intercept('GET', '/openidm/info/uiconfig').as('uiconfig');
  cy.reload();
  cy.wait('@uiconfig', { timeout: 15000 });
});

When('user clicks on {string} button in {string} modal', (button, modal) => {
  cy.findByRole('dialog', { name: modal }).within(() => {
    cy.findByRole('button', { name: button }).click();
  });
});

When('user clicks on {string} button', (button) => {
  cy.findByRole('button', { name: button }).click();
});

When('user clicks on {string} disabled button', (button) => {
  cy.findByRole('button', { name: button }).click({ force: true });
});

When('user clicks on {string} button after waiting for {double} seconds', (button, seconds) => {
  cy.findByRole('button', { name: button }).wait(seconds * 1000).click();
});

When('user clicks on {string} link', (link) => {
  cy.findByRole('link', { name: link }).click();
});

When('user clicks on option button {string} from more actions menu for item {string}', (option, item) => {
  cy.findAllByRole('row')
    .contains('td', item).parents('tr')
    .within(() => {
      cy.findByRole('button', { name: 'More Actions' }).click();
      cy.findByRole('menuitem', { name: new RegExp(option, 'i') }).click({ force: true });
    });
});

When('user clicks on {string} menu option in side navigation bar', (menuOption) => {
  cy.findByRole('link', { name: menuOption }).click();
});

When('user clicks on {string} submenu option under {string} in side navigation bar', (subMenuOption, parentMenu) => {
  cy.findByRole('button', { name: parentMenu }).click();
  cy.findByRole('link', { name: subMenuOption }).click();
});

Then('{string} button is enabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.enabled');
});

Then('buttons are enabled:', (dataTable) => {
  dataTable.raw().forEach((buttonName) => {
    cy.findByRole('button', { name: buttonName }).should('be.enabled');
  });
});

Then('{string} button is disabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.disabled');
});

Then('{string} modal no longer exists', (modal) => {
  cy.findByRole('dialog', { name: modal })
    .should('not.exist');
});

Then('notification is displayed with text {string}', (message) => {
  cy.findByRole('alert', { name: message, timeout: 10000 })
    .should('be.visible');
});

Then('{string} error message is displayed', (message) => {
  cy.findAllByRole('alert').contains(message).should('be.visible');
});

Then('{string} error message does not exists', (message) => {
  cy.findAllByRole('alert').contains(message).should('not.exist');
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

When('user clicks on {string} menu item from top right user menu', (menuItem) => {
  cy.findByTestId('fr-main-navbar').within(() => {
    cy.findByRole('button').click();
    cy.findByRole('menuitem', { name: menuItem }).click();
  });
});

Then('page url contains {string}', (url) => {
  cy.url().should('include', url);
});

Then('page url does not contain {string}', (url) => {
  cy.url().should('not.include', url);
});

Then('{string} field has {string} validation error', (fieldLabel, expectedError) => {
  cy.contains('label', fieldLabel)
    .should('exist')
    .invoke('attr', 'for')
    .then((inputId) => {
      cy.get(`#${inputId}`).should('exist');

      cy.get('[role="alert"].fr-validation-requirements.error-messages')
        .should('be.visible')
        .and('contain.text', expectedError);
    });
});

Then('error message {string} is visible in locale dropdown', (expectedError) => {
  cy.findByRole('textbox', { name: /Locale/i }).then(($input) => {
    const listboxId = $input.attr('aria-controls');

    cy.get(`#${listboxId}`)
      .should('be.visible')
      .within(() => {
        cy.findByText(expectedError)
          .should('be.visible')
          .and('have.class', 'text-danger');
      });
  });
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

Then('the value of the {string} field is the stored value of {string}', (fieldName, expectedValue) => {
  cy.findByLabelText(fieldName).should('have.value', Cypress.env(expectedValue));
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

Then('admin dashboard is loaded', () => {
  cy.findAllByTestId('dashboard-welcome-title', { timeout: 15000 }).should('be.visible');
  const username = Cypress.env('IS_FRAAS') ? Cypress.env('AM_USERNAME') : 'Platform Admin';
  cy.findAllByText(username).should('exist');
});

Then('more actions menu for item {string} has following buttons options:', (item, dataTable) => {
  cy.findAllByRole('row')
    .contains('td', item).parents('tr')
    .within(() => {
      cy.findByRole('button', { name: 'More Actions' }).click();
      dataTable.raw().forEach((buttonOption) => {
        cy.findByRole('menuitem', { name: new RegExp(buttonOption, 'i') }).should('exist');
      });
      cy.findByRole('button', { name: 'More Actions' }).click();
    });
});

Then('more actions menu for item {string} does not have following buttons options:', (item, dataTable) => {
  cy.findAllByRole('row')
    .contains('td', item).parents('tr')
    .within(() => {
      cy.findByRole('button', { name: 'More Actions' }).click();
      dataTable.raw().forEach((buttonOption) => {
        cy.findByRole('menuitem', { name: new RegExp(buttonOption, 'i') }).should('not.exist');
      });
      cy.findByRole('button', { name: 'More Actions' }).click();
    });
});

Then('{string} button has {string} attribute with value {string}', (buttonName, attribute, value) => {
  let newValue = value;
  if (attribute.includes('color')) newValue = hexToRgb(value);
  cy.findByRole('button', { name: buttonName })
    .should('have.css', attribute, newValue);
});

Then('user populates the following values into fields:', (dataTable) => {
  dataTable.hashes().forEach((row) => {
    cy.findByLabelText(row.Field).should('have.value', row.Value);
  });
});

Then('the item {string} does not exist in the current table', (itemName) => {
  cy.findByRole('cell', { name: itemName, timeout: 5000 }).should('not.exist');
});

Then('the item {string} is visible in the current table', (itemName) => {
  cy.findByRole('cell', { name: itemName, timeout: 5000 }).should('be.visible');
});

Then('the following items do not exist in the current table:', (dataTable) => {
  dataTable.raw().forEach((itemName) => {
    cy.findByRole('cell', { name: itemName, timeout: 5000 }).should('not.exist');
  });
});

Then('the following items are visible in the current table:', (dataTable) => {
  dataTable.raw().forEach((itemName) => {
    cy.findByRole('cell', { name: itemName, timeout: 5000 }).should('be.visible');
  });
});

Then('the value of the {string} column for the {string} item in the current table is {string}', (columnName, itemName, expectedValue) => {
  let columnIndex;
  cy.findByRole('table').within(() => {
    cy.get('thead').findAllByRole('columnheader').each((columnHeader, headerIndex) => {
      if (columnHeader.text().trim() === columnName) {
        columnIndex = headerIndex;
      }
    }).then(() => {
      cy.log(`Column ${columnName} has index ${columnIndex}`);
      cy.findAllByRole('row')
        .filter(`:has(td:contains("${itemName}"))`)
        .findAllByRole('cell')
        .eq(columnIndex)
        .should('have.text', expectedValue);
    });
  });
});
