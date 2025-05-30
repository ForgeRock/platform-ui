/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random, capitalize } from 'lodash';
import { filterTests, retryableBeforeEach } from '@e2e/util';
import {
  createIDMResource,
  deleteIDMResource,
  createIDMUser,
  deleteIDMUser,
  addRoleMember,
} from '@e2e/api/managedApi.e2e';
import { expectNotification } from '@e2e/pages/common/notification';

const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';

function openDelegatedAdminManagedPage(resourceType, resourceName, resourceId) {
  let url;
  if (resourceId) {
    url = `${Cypress.config().baseUrl}/enduser/?realm=${realm}#/edit/${resourceType}/${resourceName}/${resourceId}`;
  } else {
    url = `${Cypress.config().baseUrl}/enduser/?realm=${realm}#/list/${resourceType}/${resourceName}`;
  }
  cy.visit(url);
  let headingText;
  if (resourceType === 'internal') {
    headingText = `Internal ${capitalize(resourceName)}`;
  } else if (resourceName === 'alpha_user') {
    headingText = 'Alpha realm - User';
  } else {
    headingText = `${capitalize(resourceName)}`;
  }
  cy.findByRole('heading', { name: headingText }).should('exist');
}

function createInternalRole(internalRoleName, userId, dataOverride = {}) {
  const data = {
    description: `${internalRoleName} description`,
    name: internalRoleName,
    privileges: [
      {
        path: `managed/${Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user'}`,
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
  return createIDMResource('internal', 'role', data).then((createIDMResourceResponse) => {
    const internalRoleId = createIDMResourceResponse.body._id;
    addRoleMember(internalRoleId, userId);
    return cy.wrap(internalRoleId);
  });
}

filterTests(['@forgeops', '@cloud'], () => {
  describe('Delegated Admin', () => {
    let userName;
    let userId;

    retryableBeforeEach(() => {
      userName = `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`;
      // Log in first to admin to allow us to use admin access token to create IDM resources
      cy.loginAsAdmin().then(() => {
        createIDMUser({ userName }).then((result) => {
          userId = result.body._id;
        });
      });
    });

    afterEach(() => {
      cy.logout();
    });

    it('can view managed resources w/ appropriate columns and appropriate actions', () => {
      const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;

      // Create internal role
      createInternalRole(internalRoleName, userId).then((internalRoleId) => {
        // Log out of admin and into created user
        cy.logout();
        cy.loginAsEnduser(userName);

        // Navigate to Role list view and ensure that columns do/don't appear based on permissions set on role
        openDelegatedAdminManagedPage('internal', 'role');
        cy.findByRole('columnheader', { name: 'Name (Click to sort ascending)' });
        cy.findByRole('columnheader', { name: 'Description (Click to sort ascending)' }).should('not.exist');

        // Ensure that only action available is edit, and no New button exists
        cy.findByRole('searchbox', { name: 'Search' }).type(`${internalRoleName}{enter}`);
        cy.findByRole('cell', { name: internalRoleName }).should('exist').closest('tr').within(() => {
          cy.findByRole('button').click();
          cy.findAllByRole('menuitem').should('have.length', 1);
          cy.findByRole('menuitem', { name: 'Edit' });
        });
        cy.findByRole('button', { name: 'New Internal Role' }).should('not.exist');

        // navigate to user list to ensure we have add, delete, and edit access
        openDelegatedAdminManagedPage('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user');
        cy.findByRole('searchbox', { name: 'Search' }).type(`${userName}{enter}`);
        cy.findByRole('cell', { name: userName }).should('exist').closest('tr').within(() => {
          cy.findByRole('button').click();
          cy.findAllByRole('menuitem').should('have.length', 2);
          cy.findByRole('menuitem', { name: 'Edit' });
          cy.findByRole('menuitem', { name: 'Delete' });
        });
        cy.findByRole('button', { name: `New ${Cypress.env('IS_FRAAS') ? 'Alpha realm - User' : 'User'}` });

        // remove the created internal role
        deleteIDMResource('internal', 'role', internalRoleId);
        deleteIDMUser(userId);
      });
    });

    it('Should be able to search a resource and be limited by DA available resources', () => {
      const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
      const testUserLastName = `Last${random(Number.MAX_SAFE_INTEGER)}`;

      // create second user that shows our condition for DA permissions works
      createIDMUser({ userName: `${userName}2`, sn: testUserLastName }).then((result) => {
        const testUserId = result.body._id;
        createInternalRole(internalRoleName, userId, { filter: `/sn eq "${testUserLastName}"` }).then((internalRoleId) => {
          // Log out of admin and into created user
          cy.logout();
          cy.loginAsEnduser(userName);

          // navigate to list view and ensure only test user appears (along with header row)
          openDelegatedAdminManagedPage('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user');
          cy.findByRole('searchbox', { name: 'Search' }).type('Last{enter}');
          cy.findAllByRole('row').should('have.length', 2);
          cy.findByRole('cell', { name: `${userName}2` });

          // remove the test user and role
          deleteIDMUser(testUserId);
          deleteIDMUser(userId);
          deleteIDMResource('internal', 'role', internalRoleId);
        });
      });
    });

    it('can edit resource & see (not edit) read fields, edit read/write fields, & not see none fields', () => {
      const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
      const postalCodeValue = 'e2eTestPostalCode';

      createInternalRole(internalRoleName, userId).then((internalRoleId) => {
        // Log out of admin and into created user
        cy.logout();
        cy.loginAsEnduser(userName);

        // Navigate to User list page
        openDelegatedAdminManagedPage('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', userId);
        // ensure postalCode is editable, country is visible but not editable, & stateProvince is not visable
        cy.findByLabelText('Postal Code').type(postalCodeValue).should('have.value', postalCodeValue);
        cy.findByLabelText('Country').should('be.disabled');
        cy.findByLabelText('State/Province').should('not.exist');

        // remove the test role
        deleteIDMResource('internal', 'role', internalRoleId);
        deleteIDMUser(userId);
      });
    });

    it('can edit a user and see relationships and have appropriate interaction with that relationship\'s permissions', () => {
      const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
      const managedRoleName = `e2eManagedRole${random(Number.MAX_SAFE_INTEGER)}`;

      createInternalRole(internalRoleName, userId).then((internalRoleId) => {
        // create managed role (which user does not have DA permission to)
        createIDMResource(
          'managed',
          Cypress.env('IS_FRAAS') ? 'alpha_role' : 'role',
          { description: `${managedRoleName} description`, name: managedRoleName },
        ).then((createManagedRoleResponse) => {
          const managedRoleId = createManagedRoleResponse.body._id;

          // Add current user to this role
          addRoleMember(managedRoleId, userId, 'managed');

          // Log out of admin and into created user
          cy.logout();
          cy.loginAsEnduser(userName);

          // Navigate to User edit page
          openDelegatedAdminManagedPage('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', userId);

          // Ensure user is able to see internal roles, but not managed roles
          cy.findByRole('tab', { name: 'Provisioning Roles' }).click();
          cy.findAllByRole('row').should('have.length', 2);
          cy.findByRole('row', { name: 'There are no records to show' });
          cy.findByRole('tab', { name: 'Authorization Roles' }).click();
          cy.findAllByRole('row').should('have.length', 2);
          cy.findByRole('cell', { name: internalRoleName });
          // Ensure user can add and delete internal roles
          cy.findByRole('button', { name: 'Add Authorization Roles' }).click();
          cy.findByRole('dialog').findAllByLabelText('Authorization Roles').first().click({ force: true })
            .type(`${internalRoleName}`);
          cy.findByRole('dialog').get('.multiselect__option--highlight').contains(internalRoleName);
          cy.findByRole('dialog').findAllByLabelText('Authorization Roles').first().type('{enter}');
          cy.contains('.multiselect__tag', internalRoleName);
          cy.findByRole('button', { name: 'Cancel' }).click();

          cy.get('.custom-checkbox').eq(3).click('left');
          cy.findByRole('button', { name: 'Remove' }).click();
          cy.findByRole('dialog').findByRole('button', { name: 'Remove' }).click();
          expectNotification('Authorization Roles successfully removed');

          // remove the managed and internal roles created for the test
          deleteIDMUser(userId);
          deleteIDMResource('internal', 'role', internalRoleId);
          deleteIDMResource(
            'managed',
            Cypress.env('IS_FRAAS') ? 'alpha_role' : 'role',
            managedRoleId,
          );
        });
      });
    });

    it('can add & delete a resource (based on permissions) and properly display errors when a required field is not met', () => {
      const internalRoleName = `e2eInternalRole${random(Number.MAX_SAFE_INTEGER)}`;
      let testUserId;
      cy.intercept('POST', `/openidm/managed/${Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user'}?_action=create`).as('saveManagedUser');

      createInternalRole(internalRoleName, userId).then((internalRoleId) => {
        // Log out of admin and into created user
        cy.logout();
        cy.loginAsEnduser(userName);

        // Navigate to User list page, and open create modal
        openDelegatedAdminManagedPage('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user');
        cy.findByRole('button', { name: `New ${Cypress.env('IS_FRAAS') ? 'Alpha realm - User' : 'User'}` }).click();

        // fill in fields, ensuring that Save button only enabled when all fields filled in with no errors
        cy.findByLabelText('Username').should('be.visible').should('be.focused').type(`e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`);
        cy.findByLabelText('First Name').type('First');
        cy.findByLabelText('Last Name').type('Last');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        cy.findByLabelText('Email Address').type('badEmail@email').blur();
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        cy.findAllByRole('alert').contains('Invalid email format (example@example.com)');
        cy.findByLabelText('Email Address').type('.com').blur();
        cy.findByRole('button', { name: 'Save' }).click();
        cy.wait('@saveManagedUser').then(({ response }) => {
          testUserId = response.body._id;

          // After successful creation, navigate to created user
          expectNotification(Cypress.env('IS_FRAAS') ? 'Alpha realm - User successfully created' : 'User successfully created');
          openDelegatedAdminManagedPage('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', testUserId);

          // open delete modal and delete user
          cy.findByRole('button', { name: Cypress.env('IS_FRAAS') ? 'Delete Alpha realm - User' : 'Delete User' }).click();
          cy.findByRole('dialog', { name: /Delete/i }).within(() => {
            cy.findByRole('button', { name: /Delete/i }).click();
          });
          expectNotification(Cypress.env('IS_FRAAS') ? 'Successfully deleted alpha_user' : 'Successfully deleted user');

          // Delete the test role
          deleteIDMResource('internal', 'role', internalRoleId);
        });
      });
    });
  });
});
