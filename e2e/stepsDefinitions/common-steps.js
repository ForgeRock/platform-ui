/**
 * Copyright 2025-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { random } from 'lodash';
import { addOverrides } from '@e2e/api/localizationApi.e2e';
import {
  ROLES, THEME_UI_FIELD_MAPPING, HTML_ELEMENT_SELECTORS, PLURAL_TO_SINGULAR_ROLES,
} from '@e2e/support/constants';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import generateRandomEndUser from '../utils/endUserData';
import {
  checkElementCss,
  selectDropdownOption,
  typeIntoField,
  clearDropdown,
  getDropdownTrigger,
  selectRadioOption,
} from '../utils/uiUtils';
import { generateJourneyURL } from '../utils/journeyUtils';
import LOCALES from '../../packages/platform-enduser/e2e/support/constants';

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
        Cypress.env('endUserEmail', endUser.emailAddress);
        Cypress.env('endUserPassword', endUser.password);
        Cypress.env('endUserId', result.body._id);
      });
    });
  }
});

Given('enduser logs into {journey} journey', (journeyName) => {
  const userName = Cypress.env('endUserName');
  const password = Cypress.env('endUserPassword');
  const successLogin = true;
  const loginUrl = generateJourneyURL(journeyName);
  const givenName = Cypress.env('endUserFirstName');

  cy.loginAsEnduser(
    userName,
    password,
    successLogin,
    loginUrl,
    givenName,
  );
});

/**
 * Creates multiple end user accounts with random credentials, stores them with numbered environment variables
 * Usage: Given 3 enduser accounts are created via API
 */
Given('{int} enduser accounts are created via API', (userCount) => {
  if (!Cypress.env('ACCESS_TOKEN')) {
    cy.loginAsAdmin();
  }

  for (let i = 1; i <= userCount; i += 1) {
    if (!Cypress.env(`endUserId${i}`)) {
      const endUser = generateRandomEndUser();
      cy.log(`Creating new IDM enduser ${i}: ${endUser.username}`).then(() => {
        createIDMUser({
          userName: endUser.username,
          password: endUser.password,
          givenName: endUser.firstName,
          sn: endUser.lastName,
          mail: endUser.emailAddress,
        }).then((result) => {
          expect(result.status).to.equal(201);
          Cypress.env(`endUserName${i}`, endUser.username);
          Cypress.env(`endUserFirstName${i}`, endUser.firstName);
          Cypress.env(`endUserLastName${i}`, endUser.lastName);
          Cypress.env(`endUserPassword${i}`, endUser.password);
          Cypress.env(`endUserId${i}`, result.body._id);
        });
      });
    }
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

Given('{string} language is set via API', (localeCode) => {
  const locale = Object.values(LOCALES).find((localeObject) => localeObject.code === localeCode);
  addOverrides(locale.code, locale.translations);
});

Given('browser locale is set to {string}', (locale) => {
  const localesList = locale.split(',');
  Cypress.env('LOCALESLIST', localesList);
  Cypress.env('LOCALE', localesList[0]);
});

When('user clicks on {string} {role}', (name, role) => {
  cy.findByRole(role, { name: new RegExp(name, 'i') }).click();
});

/**
 * Clicks on an element by its exact accessible name and role.
 * This step should only be used when multiple elements would match the regex pattern
 * used in the standard "user clicks on {string} {role}" step.
 *
 * @example
 * // Use this step when you have overlapping element names like:
 * // - "Users" button and "Users & Roles" button on the same page
 * // - "Save" and "Save & Continue" buttons
 * When user clicks on "Users" button with exact accessible name
 *
 * @param {string} name - The exact accessible name of the element (case-sensitive)
 * @param {string} role - The ARIA role of the element to find
 */
When('user clicks on {string} {role} with exact accessible name', (name, role) => {
  cy.findByRole(role, { name }).click();
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

When(/^user types the following text to the (markdown|css) editor:$/, (editorType, text) => {
  const editorClass = editorType === 'markdown' ? '.markdown-editor' : '.css-editor';
  cy.get(`${editorClass} [role="textbox"]`).clear().type(text, { parseSpecialCharSequences: false });
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

/**
 * Click a specific option from a dropdown menu.
 * Supports standard labeled buttons (partial match, e.g., "Type") and the "More actions" (three-dots) menu.
 * @example
 * When user clicks "JavaScript" option on "Type" dropdown menu
 * @example
 * When user clicks "Edit Details" option on "More Actions" dropdown menu
 */
When('user clicks {string} option on {string} dropdown menu', (option, dropdown) => {
  getDropdownTrigger(dropdown).click();
  cy.get('.dropdown-menu.show')
    .should('be.visible')
    .within(() => {
      cy.findByRole('menuitem', { name: new RegExp(option, 'i') })
        .scrollIntoView()
        .click();
    });
});

When('user selects {string} option on dropdown', (optionName) => {
  selectDropdownOption(optionName);
});

When('user selects {string} option on dropdown {string}', (option, dropdown) => {
  cy.findByRole('combobox', { name: dropdown }).click();
  selectDropdownOption(option);
});

When('user types and selects {string} option on dropdown {string}', (option, dropdown) => {
  cy.findByRole('combobox', { name: dropdown }).click().type(option);
  selectDropdownOption(option);
});

When('user types and selects the stored value of {string} option on dropdown {string}', (storedDataName, dropdown) => {
  const storedValue = Cypress.env(storedDataName);
  cy.findByRole('combobox', { name: dropdown }).click().type(storedValue);
  selectDropdownOption(storedValue);
});

When('user closes the {string} dropdown', (dropdown) => {
  cy.findByRole('combobox', { name: dropdown }).type('{esc}');
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

When('user forcefully clicks on {string} button', (button) => {
  cy.findByRole('button', { name: button }).realClick({ force: true });
});

When('user clicks on {string} button after waiting for {double} seconds', (button, seconds) => {
  cy.findByRole('button', { name: button }).wait(seconds * 1000).click();
});

When('user focuses {string} {role}', (name, role) => {
  cy.findByRole(role, { name }).focus();
});

When('user hovers {string} {role}', (name, role) => {
  cy.findByRole(role, { name })
    .scrollIntoView()
    .realHover();
});

When('user clicks on option button {string} from more actions menu for item {string}', (option, item) => {
  cy.contains('tr, .card-header', item)
    .as('targetRow')
    .within(() => {
      cy.get('button[aria-label="More Actions"], .dropdown-toggle')
        .should('exist')
        .click();
    });
  cy.get('ul[role="menu"], .dropdown-menu')
    .filter(':visible')
    .should('be.visible')
    .within(() => {
      cy.contains('[role="menuitem"], .dropdown-item', new RegExp(option, 'i'))
        .click({ force: true });
    });
});

When(/^user (forcefully )?clicks on "([^"]*)" button for item "([^"]*)"$/, (forcefully, buttonName, item) => {
  const clickOptions = forcefully ? { force: true } : undefined;
  cy.findAllByRole('cell', { name: item })
    .closest('tr')
    .within(() => {
      cy.findByRole('button', { name: buttonName }).click(clickOptions);
    });
});

When('user clicks on {string} menu option in side navigation bar', (menuOption) => {
  cy.findByRole('link', { name: menuOption }).click();
});

When('user clicks on {string} submenu option under {string} in side navigation bar', (subMenuOption, parentMenu) => {
  cy.findByRole('button', { name: parentMenu }).click();
  cy.findByRole('link', { name: subMenuOption }).click();
});

/**
 * Updates the state (checked/unchecked) of a toggleable element (Checkbox or Switch).
 * * This step is smart enough to:
 * 1. Determine the desired state based on the verb used (checks vs unchecks).
 * 2. Map semantic roles (toggle -> switch).
 * 3. Handle theme-specific field name mappings if necessary.
 * 4. Apply a force click if "forcefully" is specified in the step.
 * * @example
 * // Standard usage
 * When user checks the "Terms and Conditions" checkbox
 * When user turns off the "Dark Mode" switch
 * * // Forceful usage (bypasses Cypress visibility checks)
 * When user forcefully unchecks the "Hidden Setting" checkbox
 * * @param {string} [forcefulCapture] - Optional capture group for the word "forcefully ". If defined, `{ force: true }` is passed to the click.
 * @param {'checks'|'unchecks'|'turns on'|'turns off'} action - The verb indicating the desired final state.
 * @param {string} name - The accessible name (label text) of the element.
 * @param {'switch'|'toggle'|'checkbox'} role - The type of element to search for.
 */
When(/^user (forcefully )?(checks|unchecks|turns on|turns off) the "([^"]*)" (switch|toggle|checkbox)$/, (forcefulCapture, action, name, role) => {
  const isForce = !!forcefulCapture;
  const clickOptions = isForce ? { force: true } : {};
  const desiredState = action === 'checks' || action === 'turns on';
  const actualRole = ROLES[role] || role;
  const accessibleName = actualRole === 'switch' ? THEME_UI_FIELD_MAPPING[name] || name : name;
  cy.findByRole(actualRole, { name: accessibleName }).setToggleState(desiredState, clickOptions);
});

/**
 * Adds a value to a multi-tag input field
 * Usage: When user adds "https://example.com" to the "Sign-in URLs" tag input
 */
When('user adds {string} to the {string} tag input', (value, fieldName) => {
  cy.findByLabelText(fieldName).parent().find('.fr-tag-input').type(`${value}{enter}`, { force: true });
});

When('user adds the stored value of {string} to the {string} tag input', (storedDataName, fieldName) => {
  const value = Cypress.env(storedDataName);
  cy.findByLabelText(fieldName).parent().find('.fr-tag-input').type(`${value}{enter}`, { force: true });
});

/**
 * Removes a specific tag from a multi-tag input field by clicking its remove button
 * Usage: When user removes "https://example.com" tag from the "Sign-in URLs" tag input
 */
When('user removes {string} tag from the {string} tag input', (tagValue, fieldName) => {
  // First try to find the specific field container, then look for the tag remove button
  cy.findByLabelText(fieldName)
    .parent()
    .find(`[data-testid="remove-${tagValue}-tag"]`)
    .click();
});

/**
 * Updates the state (checked/unchecked) of multiple toggleable elements (Checkbox or Switch).
 * * This step is smart enough to:
 * 1. Determine the desired state based on the verb used (checks vs unchecks).
 * 2. Map semantic roles (toggle -> switch).
 * 3. Handle theme-specific field name mappings if necessary.
 * 4. Apply a force click if "forcefully" is specified in the step.
 * * @example
 * // Standard usage
 * When user checks the following checkboxes:
 *   | Terms and Conditions |
 *   | Privacy Policy       |
 * When user turns off the following switches:
 *   | Dark Mode     |
 *   | Notifications |
 * * // Forceful usage (bypasses Cypress visibility checks)
 * When user forcefully unchecks the following checkboxes:
 *   | Hidden Setting 1 |
 *   | Hidden Setting 2 |
 * * @param {string} [forcefulCapture] - Optional capture group for the word "forcefully ". If defined, `{ force: true }` is passed to the click.
 * @param {'checks'|'unchecks'|'turns on'|'turns off'} action - The verb indicating the desired final state.
 * @param {'switches'|'toggles'|'checkboxes'} role - The type of elements to search for (plural form).
 * @param {DataTable} dataTable - Table containing the names of the elements to toggle.
 */
When(/^user (forcefully )?(checks|unchecks|turns on|turns off) the following (switches|toggles|checkboxes):$/, (forcefulCapture, action, role, dataTable) => {
  const isForce = !!forcefulCapture;
  const clickOptions = isForce ? { force: true } : {};
  const desiredState = action === 'checks' || action === 'turns on';
  const singularRole = PLURAL_TO_SINGULAR_ROLES[role] || role.slice(0, -2);
  const actualRole = ROLES[singularRole] || singularRole;

  dataTable.raw().forEach(([name]) => {
    const accessibleName = actualRole === 'switch' ? THEME_UI_FIELD_MAPPING[name] || name : name;
    cy.findByRole(actualRole, { name: accessibleName }).setToggleState(desiredState, clickOptions);
  });
});

When('user clicks on copy button from field {string}', (fieldName) => {
  cy.findByLabelText(fieldName)
    .closest('.floating-label')
    .find('button[name="copyButton"]')
    .click();
});

When('the value of field {string} is stored as {string}', (fieldName, storedDataName) => {
  cy.findByLabelText(fieldName).invoke('val').then((fieldValue) => {
    Cypress.env(storedDataName, fieldValue);
  });
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

When('user clears {string} dropdown', (dropdown) => {
  clearDropdown(dropdown);
});

When('user closes the {string} modal', (modalName) => {
  cy.findByRole('dialog', { name: modalName }).within(() => {
    cy.findByRole('button', { name: 'Close' }).click();
  });
});

When('user clicks on modal header to trigger field validation', () => {
  cy.findByRole('dialog').within(() => {
    cy.get('h4, .modal-header, .modal-title').first().click();
  });
});

When(/^user (forcefully )?selects "([^"]*)" radio option$/, (forcefully, option) => {
  const options = forcefully ? { force: true } : undefined;
  selectRadioOption(option, options);
});

Then('{string} modal is displayed/opened', (modal) => {
  cy.findByRole('dialog', { name: modal })
    .should('exist');
});

Then('{string} modal is displayed after user is iddle for {int} seconds', (modal, seconds) => {
  cy.findByRole('dialog', { name: modal, timeout: seconds * 1000 })
    .should('be.visible');
});

Then('the message {string} should be present', (message) => {
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
    .scrollIntoView()
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

Then(/^the "([^"]*)" field is (enabled|disabled)$/, (fieldName, expectedState) => {
  const assertion = expectedState === 'enabled' ? 'be.enabled' : 'be.disabled';
  cy.findByLabelText(fieldName).should(assertion);
});

Then('text {string} does not exist', (text) => {
  cy.findByText(text).should('not.exist');
});

Then('text {string} is visible', (text) => {
  cy.findByText(text).should('be.visible');
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
      cy.findByRole('button', { name: 'More Actions' }).as('moreActionsButton').click();
    });
  cy.get('#app').findByRole('menu').should('be.visible')
    .within(() => {
      dataTable.raw().forEach((buttonOption) => {
        cy.findByRole('menuitem', { name: new RegExp(buttonOption, 'i') }).should('exist');
      });
    });
  cy.get('@moreActionsButton').click();
});

Then('more actions menu for item {string} does not have following buttons options:', (item, dataTable) => {
  cy.findAllByRole('row')
    .contains('td', item).parents('tr')
    .within(() => {
      cy.findByRole('button', { name: 'More Actions' }).as('moreActionsButton').click();
    });

  cy.get('#app').findByRole('menu').should('be.visible')
    .within(() => {
      dataTable.raw().forEach((buttonOption) => {
        cy.findByRole('menuitem', { name: new RegExp(buttonOption, 'i') }).should('not.exist');
      });
    });
  cy.get('@moreActionsButton').click();
});

Then('the following values have been populated into fields:', (dataTable) => {
  dataTable.hashes().forEach((row) => {
    cy.findByLabelText(row.Field).should('have.value', row.Value);
  });
});

Then('the item {string} does not exist in the current table', (itemName) => {
  cy.findByRole('cell', { name: itemName, timeout: 5000 }).should('not.exist');
});

Then('the item {string} is visible in the current table', (itemName) => {
  cy.findByRole('cell', { name: itemName, timeout: 5000 }).scrollIntoView().should('be.visible');
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

/**
 * Verifies that specific tabs are visible using a data table
 * Usage:
 * Then the following tabs are visible:
 *   | All Apps          |
 *   | IT infrastructure |
 *   | Healthcare        |
 */
Then('the following tabs are visible:', (dataTable) => {
  dataTable.raw().forEach((tabName) => {
    cy.findByRole('tab', { name: tabName }).should('be.visible');
  });
});

/**
 * Verifies that specific radio options are visible using a data table
 * Usage:
 * Then the following radio options are visible:
 *   | Active Directory    |
 *   | Salesforce          |
 *   | Google Workspace    |
 */
Then('the following radio options are visible:', (dataTable) => {
  dataTable.raw().forEach((optionName) => {
    cy.findByRole('radio', { name: new RegExp(optionName, 'i') }).should('exist');
  });
});

Then('the value of the {string} column for the {string} item in the current table is {string}', (columnName, itemName, expectedValue) => {
  let columnIndex;
  cy.findByRole('table').within(() => {
    cy.get('thead').findAllByRole('columnheader').each((columnHeader, headerIndex) => {
      const headerText = columnHeader.text().trim();
      const ariaLabel = columnHeader.attr('aria-label');
      if (headerText === columnName || ariaLabel === columnName) {
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

Then('the {string} modal contains {string} text', (modalName, expectedText) => {
  cy.findByRole('dialog', { name: modalName }).within(() => {
    cy.contains(expectedText).should('be.visible');
  });
});

Then('the {string} modal contains HTML {string} element', (modalName, expectedHtml) => {
  cy.findByRole('dialog', { name: modalName }).should('contain.html', expectedHtml);
});

Then('{string} button is visible', (button) => {
  cy.findByRole('button', { name: button }).should('be.visible');
});

Then('{string} button does not exist', (button) => {
  cy.findByRole('button', { name: button }).should('not.exist');
});

/**
 * Verifies the visibility of options within a specific dropdown menu.
 * Supports standard labeled buttons (partial match, e.g., "Type") and the "More actions" (three-dots) menu.
 * @example
 * Then "Type" dropdown menu has following options:
 * | JavaScript |
 * | Groovy     |
 * @example
 * Then "More Actions" dropdown menu has following options:
 * | Edit Details |
 * | Delete       |
 */
Then('{string} dropdown menu has following options:', (dropdown, dataTable) => {
  getDropdownTrigger(dropdown).click();
  cy.get('.dropdown-menu.show')
    .should('be.visible')
    .within(() => {
      dataTable.raw().flat().forEach((option) => {
        cy.findByRole('menuitem', { name: new RegExp(option, 'i') })
          .scrollIntoView()
          .should('be.visible');
      });
    });
  cy.get('body').click(0, 0);
});

Then('{string} dropdown menu is visible', (dropdown) => {
  getDropdownTrigger(dropdown).should('be.visible');
});

Then('{string} dropdown menu does not exist', (dropdown) => {
  getDropdownTrigger(dropdown).should('not.exist');
});

Then('elements have following attributes with values:', (dataTable) => {
  dataTable.hashes().forEach((row) => {
    checkElementCss(row.Role, row.Name, row.Attribute, row.Value);
  });
});

Then('the {string} {role} has {string} attribute with value {string}', (name, role, attribute, value) => {
  checkElementCss(role, name, attribute, value);
});

/**
 * Verifies that a modal contains elements with specific CSS properties
 * This is a generic step that can be used for any modal dialog
 * Usage: Then the "Terms & Conditions" modal should have elements with CSS properties:
 *          | Text      | CSS Property | CSS Value |
 *          | Bold text | font-weight  | 700       |
 */
Then('the {string} modal should have elements with CSS properties:', (modalName, dataTable) => {
  cy.findByRole('dialog', { name: modalName }).within(() => {
    dataTable.hashes().forEach((row) => {
      cy.contains(row.Text).should('have.css', row['CSS Property'], row['CSS Value']);
    });
  });
});

/**
 * Verifies that a modal contains elements mapped by semantic types
 * This step maps user-friendly names to HTML elements for better readability
 * Usage: Then the "Terms & Conditions" modal should contain elements with semantic types:
 *          | Text             | Element Type |
 *          | h1 Heading 8-)   | Main Heading |
 *          | This is bold     | Bold Text    |
 *          | Visit link       | Link         |
 */
Then('the {string} modal should contain elements with semantic types:', (modalName, dataTable) => {
  cy.findByRole('dialog', { name: modalName }).within(() => {
    dataTable.hashes().forEach((row) => {
      const htmlElement = HTML_ELEMENT_SELECTORS[row['Element Type']];
      cy.contains(row.Text).should('match', htmlElement);
    });
  });
});

Then('the preview iframe contains {string} text', (expectedText) => {
  cy.get('iframe').then(($iframe) => {
    const iframeBody = $iframe.contents().find('body');
    cy.wrap(iframeBody).should('contain', expectedText);
  });
});

Then('the preview iframe contains {string} HTML', (expectedHtml) => {
  cy.get('iframe').then(($iframe) => {
    const iframeBody = $iframe.contents().find('body');
    cy.wrap(iframeBody).should('contain.html', expectedHtml);
  });
});

Then('{string} button is enabled in the {string} modal', (buttonName, modalName) => {
  cy.findByRole('dialog', { name: modalName }).within(() => {
    cy.findByRole('button', { name: buttonName }).should('be.enabled');
  });
});

Then('{string} button is disabled in the {string} modal', (buttonName, modalName) => {
  cy.findByRole('dialog', { name: modalName }).within(() => {
    cy.findByRole('button', { name: buttonName }).should('be.disabled');
  });
});

Then('{string} checkbox is disabled', (checkboxName) => {
  cy.findByRole('checkbox', { name: checkboxName }).should('be.disabled');
});

Then(/^the "([^"]*)" (switch|toggle|checkbox) is (checked|unchecked|turned on|turned off)$/, (name, role, state) => {
  const expectedState = state === 'checked' || state === 'turned on';
  const actualRole = ROLES[role] || role;
  const accessibleName = actualRole === 'switch' ? THEME_UI_FIELD_MAPPING[name] || name : name;
  cy.findByRole(actualRole, { name: accessibleName }).verifyToggleState(expectedState);
});

Then(/^the following (switches|toggles|checkboxes) are (checked|unchecked|turned on|turned off):$/, (role, state, dataTable) => {
  const expectedState = state === 'checked' || state === 'turned on';
  const singularRole = PLURAL_TO_SINGULAR_ROLES[role] || role.slice(0, -2);
  const actualRole = ROLES[singularRole] || singularRole;

  dataTable.raw().forEach(([name]) => {
    const accessibleName = actualRole === 'switch' ? THEME_UI_FIELD_MAPPING[name] || name : name;
    cy.findByRole(actualRole, { name: accessibleName }).verifyToggleState(expectedState);
  });
});

Then('{string} link is visible', (linkText) => {
  cy.findByRole('link', { name: linkText }).should('be.visible');
});

Then('{string} link does not exist', (linkText) => {
  cy.findByRole('link', { name: linkText }).should('not.exist');
});

Then('{string} tab is selected', (tabName) => {
  cy.findByRole('tab', { name: tabName }).should('have.attr', 'aria-selected', 'true');
});

Then('{string} dropdown has {string} option selected', (dropdown, option) => {
  cy.findByRole('combobox', { name: dropdown })
    .should('exist')
    .within(() => {
      cy.get('.multiselect__tag, .multiselect__single')
        .contains(new RegExp(option, 'i'))
        .should('be.visible');
    });
});

Then('{string} dropdown menu has {string} option selected', (dropdown, option) => {
  getDropdownTrigger(dropdown)
    .scrollIntoView()
    .should('be.visible')
    .and('contain.text', option);
});

Then('the page favicon url contains {string}', (filename) => {
  cy.get('head')
    .findByTestId('favicon')
    .should('have.attr', 'href')
    .and('include', filename);
});

Then('the {string} dropdown is visible', (fieldName) => {
  cy.findByRole('combobox', { name: fieldName }).should('be.visible');
});

Then('the {string} tag input is visible', (fieldName) => {
  cy.findByLabelText(fieldName).should('exist');
});

Then(/^"([^"]*)" field is (enabled|disabled)$/, (fieldName, state) => {
  const assertion = state === 'enabled' ? 'be.enabled' : 'be.disabled';
  cy.findByLabelText(fieldName).should(assertion);
});

Then('the {string} file is downloaded', (fileName) => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.readFile(`${downloadsFolder}/${fileName}`, { timeout: 20000 });
});

Then('the clipboard contains the stored value of {string}', (storedDataName) => {
  const expectedText = Cypress.env(storedDataName);
  if (Cypress.browser.name === 'chrome' || Cypress.browser.name === 'electron') {
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((clipboardText) => {
        expect(clipboardText).to.equal(expectedText);
      });
    });
  }
});
