/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createIDMUser, deleteIDMUser } from '@e2e/api/managedApi.e2e';
import generateRandomEndUser from '@e2e/utils/endUserData';

export default class UserApiSteps {
  static createdUserIds = [];

  static createEndUser(userBody = {}) {
    const endUser = generateRandomEndUser();
    return createIDMUser({
      userName: endUser.username,
      password: endUser.password,
      givenName: endUser.firstName,
      sn: endUser.lastName,
      mail: endUser.emailAddress,
      ...userBody,
    }).then((response) => {
      expect(response.status).to.equal(201);
      UserApiSteps.createdUserIds.push(response.body._id);
      Cypress.env('endUserId', response.body._id);
      Cypress.env('endUserName', endUser.username);
      Cypress.env('endUserFirstName', endUser.firstName);
      Cypress.env('endUserLastName', endUser.lastName);
      Cypress.env('endUserEmail', endUser.emailAddress);
      Cypress.env('endUserPassword', endUser.password);
      return {
        id: response.body._id,
        username: endUser.username,
        password: endUser.password,
        firstName: endUser.firstName,
        lastName: endUser.lastName,
        email: endUser.emailAddress,
      };
    });
  }

  static deleteCreatedUsers() {
    return cy.wrap(UserApiSteps.createdUserIds).then((ids) => {
      if (!ids.length) return null;

      return cy.wrap(ids).each((id) => deleteIDMUser(id, false)).then(() => {
        UserApiSteps.createdUserIds = [];
      });
    });
  }

  static deleteEndUser() {
    return cy.wrap(null).then(() => {
      const endUserId = Cypress.env('endUserId');
      return deleteIDMUser(endUserId, false).then(() => {
        UserApiSteps.createdUserIds = UserApiSteps.createdUserIds.filter((id) => id !== endUserId);
        Cypress.env('endUserId', null);
      });
    });
  }
}
