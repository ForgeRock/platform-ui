/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random, capitalize } from 'lodash';
import { addRoleMember, createIDMResource, createIDMUser } from '../api/managedApi.e2e';
import { expectNotification } from '../pages/common/notification';

function openDelegatedAdminManagedPage(resourceType, resourceName, resourceId) {
  let url;
  if (resourceId) {
    url = `${Cypress.config().baseUrl}/enduser/?realm=root#/edit/${resourceType}/${resourceName}/${resourceId}`;
  } else {
    url = `${Cypress.config().baseUrl}/enduser/?realm=root#/list/${resourceType}/${resourceName}`;
  }
  cy.visit(url);
  let headingText;
  if (resourceType === 'internal') {
    headingText = `Internal ${capitalize(resourceName)}`;
  } else {
    headingText = `${capitalize(resourceName)}`;
  }
  cy.findByRole('heading', { name: headingText }).should('exist');
}

function createInternalRole(internalRoleName, userId, dataOverride) {
  return cy.wait('@getAccessToken').then(({ response }) => {
    const accessToken = response.body.access_token;
    const data = {
      description: `${internalRoleName} description`,
      name: internalRoleName,
      privileges: [
        {
          path: 'managed/user',
          name: 'Users',
          actions: [],
          permissions: [
            'VIEW',
            'CREATE',
            'UPDATE',
            'DELETE',
          ],
          accessFlags: [
            {
              attribute: 'userName',
              readOnly: false,
            },
            {
              attribute: 'password',
              readOnly: false,
            },
            {
              attribute: 'givenName',
              readOnly: false,
            },
            {
              attribute: 'cn',
              readOnly: false,
            },
            {
              attribute: 'sn',
              readOnly: false,
            },
            {
              attribute: 'mail',
              readOnly: false,
            },
            {
              attribute: 'description',
              readOnly: false,
            },
            {
              attribute: 'accountStatus',
              readOnly: false,
            },
            {
              attribute: 'telephoneNumber',
              readOnly: false,
            },
            {
              attribute: 'postalAddress',
              readOnly: false,
            },
            {
              attribute: 'city',
              readOnly: false,
            },
            {
              attribute: 'postalCode',
              readOnly: false,
            },
            {
              attribute: 'country',
              readOnly: true,
            },
            // { hide this to allow test to check field does not show up
            //   attribute: 'stateProvince',
            //   readOnly: false,
            // },
            {
              attribute: 'roles',
              readOnly: false,
            },
            {
              attribute: 'manager',
              readOnly: false,
            },
            {
              attribute: 'authzRoles',
              readOnly: false,
            },
            {
              attribute: 'reports',
              readOnly: false,
            },
            {
              attribute: 'effectiveRoles',
              readOnly: false,
            },
            {
              attribute: 'effectiveAssignments',
              readOnly: false,
            },
            {
              attribute: 'lastSync',
              readOnly: false,
            },
            {
              attribute: 'kbaInfo',
              readOnly: false,
            },
            {
              attribute: 'preferences',
              readOnly: false,
            },
            {
              attribute: 'consentedMappings',
              readOnly: false,
            },
          ],
          ...dataOverride,
        },
        {
          path: 'internal/role',
          name: 'Internal Roles',
          actions: [],
          permissions: [
            'VIEW',
            'UPDATE',
          ],
          accessFlags: [
            {
              attribute: 'name',
              readOnly: false,
            },
            {
              attribute: 'privileges',
              readOnly: false,
            },
            {
              attribute: 'authzMembers',
              readOnly: false,
            },
            {
              attribute: 'temporalConstraints',
              readOnly: false,
            },
            {
              attribute: 'condition',
              readOnly: false,
            },
          ],
        },
      ],
    };
    createIDMResource('internal', 'role', data, accessToken).then((createIDMResourceResponse) => {
      addRoleMember(createIDMResourceResponse.body._id, userId, accessToken);
    });
  });
}

describe('Delegated Admin', () => {
  let userName;
  let userId;

  beforeEach(() => {
    cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
    userName = `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`;
    createIDMUser({ userName }).then((result) => {
      userId = result.body._id;
    });
  });

  it('can view managed resources w/ appropriate columns and appropriate actions', () => {
    const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
    // Log in first to admin to allow us to use admin access token to create internal role
    cy.login(Cypress.env('AM_USERNAME'), Cypress.env('AM_PASSWORD'), `${Cypress.config().baseUrl}/platform/`);
    createInternalRole(internalRoleName, userId);

    // Log out of admin and into created user
    cy.logout();
    cy.login(userName);

    // Navigate to Role list view and ensure that columns do/don't appear based on permissions set on role
    openDelegatedAdminManagedPage('internal', 'role');
    cy.findByRole('columnheader', { name: 'Name (Click to sort Ascending)' });
    cy.findByRole('columnheader', { name: 'Description (Click to sort Ascending)' }).should('not.exist');

    // Ensure that only action available is edit, and no New button exists
    cy.findByRole('searchbox', { name: 'Search' }).type(`${internalRoleName}{enter}`);
    cy.findByRole('row', { name: `${internalRoleName} more_horiz` }).within(() => {
      cy.findByRole('button').click();
      cy.findAllByRole('menuitem').should('have.length', 1);
      cy.findByRole('menuitem', { name: 'Edit' });
    });
    cy.findByRole('button', { name: 'New Internal Role' }).should('not.exist');

    // navigate to user list to ensure we have add, delete, and edit access
    openDelegatedAdminManagedPage('managed', 'user');
    cy.findByRole('searchbox', { name: 'Search' }).type(`${userName}{enter}`);
    cy.findByRole('row', { name: `${userName} First Last forgerockdemo@example.com more_horiz` }).within(() => {
      cy.findByRole('button').click();
      cy.findAllByRole('menuitem').should('have.length', 2);
      cy.findByRole('menuitem', { name: 'Edit' });
      cy.findByRole('menuitem', { name: 'Delete' });
    });
    cy.findByRole('button', { name: 'New User' });
  });

  it('Should be able to search a resource and be limited by DA available resources', () => {
    const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
    const testUserLastName = `Last${random(Number.MAX_SAFE_INTEGER)}`;
    // Log in first to admin to allow us to use admin access token to create internal role
    cy.login(Cypress.env('AM_USERNAME'), Cypress.env('AM_PASSWORD'), `${Cypress.config().baseUrl}/platform/`);
    // create second user that shows our condition for DA permissions works
    createIDMUser({ userName: `${userName}2`, sn: testUserLastName });
    createInternalRole(internalRoleName, userId, { filter: `/sn eq "${testUserLastName}"` });

    // Log out of admin and into created user
    cy.logout();
    cy.login(userName);

    // navigate to list view and ensure only test user appears (along with header row)
    openDelegatedAdminManagedPage('managed', 'user');
    cy.findByRole('searchbox', { name: 'Search' }).type('Last{enter}');
    cy.findAllByRole('row').should('have.length', 2);
    cy.findByRole('row', { name: `${userName}2 First ${testUserLastName} forgerockdemo@example.com more_horiz` });
  });

  it('can edit resource & see (not edit) read fields, edit read/write fields, & not see none fields', () => {
    const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
    const postalCodeValue = 'e2eTestPostalCode';
    // Log in first to admin to allow us to use admin access token to create internal role
    cy.login(Cypress.env('AM_USERNAME'), Cypress.env('AM_PASSWORD'), `${Cypress.config().baseUrl}/platform/`);
    createInternalRole(internalRoleName, userId);

    // Log out of admin and into created user
    cy.logout();
    cy.login(userName);

    // Navigate to User list page
    openDelegatedAdminManagedPage('managed', 'user', userId);
    // ensure postalCode is editable, country is visible but not editable, & stateProvince is not visable
    cy.findByPlaceholderText('Postal Code').type(postalCodeValue).should('have.value', postalCodeValue);
    cy.findByPlaceholderText('Country').should('be.disabled');
    cy.findByPlaceholderText('State/Province').should('not.exist');
  });

  it('can edit a user and see relationships and have appropriate interaction with that relationship\'s permissions', () => {
    const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
    const managedRoleName = `e2eManagedRole${random(Number.MAX_SAFE_INTEGER)}`;
    // Log in first to admin to allow us to use admin access token to create internal role with current user assigned this new internal role
    cy.login(Cypress.env('AM_USERNAME'), Cypress.env('AM_PASSWORD'), `${Cypress.config().baseUrl}/platform/`);
    createInternalRole(internalRoleName, userId);

    // create managed role (which user does not have DA permission to)
    cy.wait('@getAccessToken').then(({ response }) => {
      createIDMResource('managed', 'role', { description: `${managedRoleName} description`, name: managedRoleName }).then((createIDMResourceResponse) => {
        // Add current user to this role
        addRoleMember(createIDMResourceResponse.body._id, userId, response.body.access_token, 'managed');
      });
    });

    // Log out of admin and into created user
    cy.logout();
    cy.login(userName);

    // Navigate to User edit page
    openDelegatedAdminManagedPage('managed', 'user', userId);

    // Ensure user is able to see internal roles, but not managed roles
    cy.findByRole('tab', { name: 'Provisioning Roles' }).click();
    cy.findAllByRole('row').should('have.length', 2);
    cy.findByRole('row', { name: 'There are no records to show' });
    cy.findByRole('tab', { name: 'Authorization Roles' }).click();
    cy.findAllByRole('row').should('have.length', 2);
    cy.findByRole('cell', { name: internalRoleName });
    // Ensure user can add and delete internal roles
    cy.findByRole('button', { name: 'Add Authorization Roles' }).click();
    cy.findByRole('dialog').findByLabelText('Authorization Roles').click({ force: true }).type(`${internalRoleName}`);
    cy.findByRole('dialog').get('.multiselect__option--highlight').contains(internalRoleName);
    cy.findByRole('dialog').findByLabelText('Authorization Roles').type('{enter}');
    cy.contains('.multiselect__tag', internalRoleName);
    cy.findByRole('button', { name: 'Cancel' }).click();

    cy.get('.custom-checkbox').eq(1).click('left');
    cy.findByRole('button', { name: 'Remove' }).click();
    cy.findByRole('dialog').findByRole('button', { name: 'Remove' }).click();
    expectNotification('Authorization Roles successfully removed');
  });

  it('can add & delete a resource (based on permissions) and properly display errors when a required field is not met', () => {
    const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
    let testUserId;
    cy.intercept('POST', '/openidm/managed/user?_action=create').as('saveManagedUser');
    // Log in first to admin to allow us to use admin access token to create internal role
    cy.login(Cypress.env('AM_USERNAME'), Cypress.env('AM_PASSWORD'), `${Cypress.config().baseUrl}/platform/`);
    createInternalRole(internalRoleName, userId);

    // Log out of admin and into created user
    cy.logout();
    cy.login(userName);

    // Navigate to User list page, and open create modal
    openDelegatedAdminManagedPage('managed', 'user');
    cy.findByRole('button', { name: 'New User' }).click();

    // fill in fields, ensuring that Save button only enabled when all fields filled in with no errors
    cy.findByPlaceholderText('Username').type(`e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`);
    cy.findByPlaceholderText('First Name').type('First');
    cy.findByPlaceholderText('Last Name').type('Last');
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
    cy.findByPlaceholderText('Email Address').type('badEmail@email');
    cy.findByRole('button', { name: 'Save' }).should('be.disabled');
    cy.findAllByRole('alert').contains('The mail field must be a valid email');
    cy.findByPlaceholderText('Email Address').type('.com');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.wait('@saveManagedUser').then(({ response }) => {
      testUserId = response.body._id;

      // After successful creation, navigate to created user
      expectNotification('User successfully created');
      openDelegatedAdminManagedPage('managed', 'user', testUserId);

      // open delete modal and delete user
      cy.findByRole('button', { name: 'Delete User' }).click();
      cy.findByRole('dialog', { name: 'Confirm Deletion' }).within(() => {
        cy.findByRole('button', { name: 'Delete' }).click();
      });
      expectNotification('Successfully deleted user');
    });
  });
});
