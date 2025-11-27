/**
 * Copyright 2021-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import '@neuralegion/cypress-har-generator/commands';
import 'cypress-real-events/support';
import generatePageURL from '../utils/adminUtils';
import { importJourneysViaAPI, deleteJourneysViaAPI } from '../utils/manageJourneys';

// Method that fills in the Admin Login form and sends it
function fillAndSendLoginForm() {
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');

  // Fill in Admin name and password and Login
  cy.findByLabelText(/User Name/i, { timeout: 5000 }).should('be.visible').type(adminUserName, { force: true });
  cy.findAllByLabelText(/Password/i).first().should('be.visible').type(adminPassword, { force: true });
  cy.findByRole('button', { name: /Next/i }).should('be.visible').click();

  // Skip 2FA on Cloud Tenants
  if (Cypress.env('IS_FRAAS')) {
    cy.findByRole('status', { timeout: 3000 }).should('not.exist');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.findByRole('button', { name: /Skip for now/i }).should('be.visible').wait(100).click();
  }
}

// Method to fetch ACCESS_TOKEN with retry option
function fetchAccessToken(retries = 5, attempt = 0) {
  let retry = attempt;
  cy.wait('@getAccessToken').then(({ response }) => {
    // Fetch ACCESS_TOKEN only if the response is successful and the IDM scope is correct
    if (response.statusCode === 200 && response.body.scope === Cypress.env('IS_FRAAS') ? 'fr:idm:*' : 'openid fr:idm:*') {
      // Use the access token from the admin login as the API access token for this test
      // Note that for code to use this access token it needs to be queued to execute
      // afterwards by Cypress with a then block or similar
      cy.log('ACCESS_TOKEN fetched successfully');
      Cypress.env('ACCESS_TOKEN', response.body);
    } else if (retry < retries) {
      retry += 1;
      cy.log(`Failed to fetch ACCESS_TOKEN (${response.statusCode}), retrying attempt ${retry}...`);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(200);
      fetchAccessToken(retries, retry);
    } else {
      throw new Error(`Failed to fetch ACCESS_TOKEN after ${retries} attempts!`);
    }
  });
}

Cypress.Commands.add('clearAppAuthDatabase', () => {
  indexedDB.deleteDatabase('appAuth');
});

Cypress.Commands.add('clearSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('logout', () => {
  cy.clearAppAuthDatabase();
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
});

Cypress.Commands.add('loginAsAdmin', () => {
  const loginUrl = `${Cypress.config().baseUrl}/platform/`;

  // Clear cookies and local storage
  cy.logout();

  // Set up intercept
  cy.intercept('GET', '/openidm/info/uiconfig').as('uiconfig');
  cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
  cy.intercept('GET', 'environment/release').as('getRelease');

  // Visit Admin Login URL
  cy.visit(loginUrl);

  // Wait for the Login form to load
  cy.wait('@uiconfig', { timeout: 15000 });

  // Fill in Admin name and password and Login
  fillAndSendLoginForm();

  // Access token sometimes failes to fetch on first attempt causing unwanted failures
  fetchAccessToken();

  // Wait for Dashboard to load
  cy.findAllByTestId('dashboard-welcome-title', { timeout: 15000 }).should('be.visible');

  if (Cypress.env('IS_FRAAS')) {
    // Wait for the Cloud to properly load
    cy.wait('@getRelease', { timeout: 10000 });
  }
});

Cypress.Commands.add(
  'loginAsEnduser',
  (
    userName,
    password = 'Rg_GRg9k&e',
    sucessLogin = true,
    loginUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha&authIndexType=service&authIndexValue=Login#/` : `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=Login#/`,
    givenName = 'First',
  ) => {
    // Clear cookies and local storage
    cy.logout();

    // Set up intercept
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');

    // Visit enduser URL
    cy.visit(loginUrl);

    // Wait for a Journey page to fully load
    cy.wait('@getTheme', { timeout: 10000 });

    // Fill in Enduser name and password
    cy.findByLabelText(/User Name/i, { timeout: 10000 }).should('be.visible').type(userName, { force: true });
    cy.findAllByLabelText(/Password/i).first().should('be.visible').type(password, { force: true });
    cy.findByRole('button', { name: /Next/i }).click();

    // Wait for the spinner div to disappear
    cy.findByRole('status', { timeout: 3000 }).should('not.exist');

    // Every third Login user is asked about preferences on the default Login Journey
    cy.get('body').then(($body) => {
      // Check if "Please select your preferences" screen appears
      if ($body.find('h1:contains("Please select your preferences")').length > 0) {
        // Confirm the preferences
        cy.findByRole('button', { name: /Next/i }).click();
      }
    });

    if (sucessLogin) {
      // Check for the Dashboard welcome greeting message
      cy.findAllByRole('heading', { timeout: 20000 }).contains(givenName).should('be.visible');
    }
  },
);

Cypress.Commands.add('readFixtureFile', (fileName) => {
  const globalFile = `../../e2e/fixtures/${fileName}`;
  const projectFile = `e2e/fixtures/${fileName}`;
  return cy.task('readFileWithFallback', { globalFile, projectFile })
    .then((data) => {
      if (!data) throw new Error(`File not found in: ${globalFile} or ${projectFile}`);
      return data;
    });
});

/**
* navigateToPage command navigates to a page indicating the page name or the URL of the page based on the ADMIN_PAGES constants file
* @param {page} page This can be either the page name or the page URL
* @param {isUrl} isUrl Indicates if the value of the page param is an URL or the name of the page. By default it uses the page name.
*/
Cypress.Commands.add('navigateToPage', (page, isUrl = false) => {
  cy.visit(generatePageURL(page, isUrl));
});

Cypress.Commands.add('visitJourneyUrl', (journeyUrl) => {
  cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  cy.visit(journeyUrl);
  cy.wait('@getTheme', { timeout: 10000 });
});

/**
 * !!! BEWARE !!! Use this ONLY on fixtures that do not replace any base values, scripts, Journeys, etc
 * This function overrides EVERY imported Journey including ALL dependencies using the API parsing fixtures in the passed array
 * @param {Array} fixtureArray an array containing the name of test fixture files to parse and import all dependencies
 * @param {Boolean} login a boolean to tell if tests should authenticate (in case admin is not already logged in)
 */
Cypress.Commands.add('importTreesViaAPI', (fixtureArray) => {
  cy.loginAsAdmin();
  importJourneysViaAPI(fixtureArray);
});

/**
 * !!! BEWARE !!! Use this ONLY on fixtures that do not replace any base values, scripts, Journeys, etc
 * This function deletes EVERY imported Journey including ALL dependencies using the API parsing fixtures in the passed array
 * @param {Array} fixtureArray an array containing the name of test fixture files to parse and remove all dependencies
 * @param {Boolean} login a boolean to tell if tests should authenticate (in case admin is not already logged in)
 */
Cypress.Commands.add('deleteTreesViaAPI', (fixtureArray) => {
  // Login as admin first
  cy.loginAsAdmin();

  // Use API to delete all Journeys & required data
  deleteJourneysViaAPI(fixtureArray);
});

Cypress.Commands.add('reloadUI', () => {
  // Set up intercepts
  cy.intercept('GET', 'am/json/global-config/realms/?_queryFilter=true').as('getRealms');
  cy.intercept('GET', 'environment/release').as('getRelease');

  // Reload the UI
  cy.reload();

  // Wait for the Realms to be fetched
  cy.wait('@getRealms', { timeout: 10000 });

  if (Cypress.env('IS_FRAAS')) {
    // Wait for the Cloud to properly load
    cy.wait('@getRelease', { timeout: 10000 });
  } else {
    // For some reason ForgeOps fetches the Realms twice
    cy.wait('@getRealms', { timeout: 10000 });
  }
});

Cypress.Commands.add('openApplicationListPage', () => {
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
  cy.visit(`${Cypress.config().baseUrl}/platform/?realm=${realm}#/applications`);
  cy.findByTestId('spinner-is-loading-application').should('not.exist');
  cy.findByRole('button', { name: 'Browse App Catalog', timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('openJobListPage', () => {
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
  cy.visit(`${Cypress.config().baseUrl}/platform/?realm=${realm}#/jobs`);
  cy.findByTestId('spinner-is-loading-jobs').should('not.exist');
  cy.findByRole('button', { name: 'Schedule a Job', timeout: 10000 }).should('be.visible');
});

/**
 * Custom command to set the state of a toggleable element (checkbox or switch).
 * It checks the current state and only clicks if it doesn't match the desired state.
 *
 * @example
 * // Basic usage
 * cy.findByRole('checkbox', { name: 'My Check' }).setToggleState(true);
 *
 * // Usage with click options (like forcing)
 * cy.findByRole('switch', { name: 'My Switch' }).setToggleState(false, { force: true });
 */
Cypress.Commands.add(
  'setToggleState',
  { prevSubject: 'element' },
  (subject, desiredState, clickOptions = {}) => cy.wrap(subject).scrollIntoView().then(($toggle) => {
    const currentState = $toggle.attr('aria-checked') === 'true' || $toggle.is(':checked');
    if (currentState !== desiredState) {
      cy.wrap($toggle).click(clickOptions);
    }
  }),
);

/**
 * Custom command to verify the state of a toggleable element.
 * Compatible with both native checkboxes and ARIA switches.
 *
 * @example
 * cy.findByRole('checkbox', { name: 'Subscribe' }).verifyToggleState(true);
 */
Cypress.Commands.add(
  'verifyToggleState',
  { prevSubject: 'element' },
  (subject, expectedState) => {
    cy.wrap(subject).scrollIntoView().should(($el) => {
      // 1. Check for ARIA attribute (common in switches/custom UI components)
      const ariaChecked = $el.attr('aria-checked');
      // 2. Check for native property (standard checkboxes)
      const nativeChecked = $el.is(':checked');
      // logic: If aria-checked exists, priority is usually given to it for accessibility,
      // otherwise fallback to native checked property.
      const actualState = ariaChecked !== undefined
        ? ariaChecked === 'true'
        : nativeChecked;
      // Create a clear error message for the report
      const stateLabel = expectedState ? 'checked/on' : 'unchecked/off';
      expect(actualState).to.equal(expectedState, `Expected element to be ${stateLabel}`);
    });
  },
);

Cypress.Commands.add('getIframeBody', (iframeSelector) => cy.get(iframeSelector).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap));
