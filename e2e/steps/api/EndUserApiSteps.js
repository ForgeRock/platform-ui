/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createIDMUser, deleteIDMUser } from '@e2e/api/managedApi.e2e';
import generateRandomEndUser from '@e2e/utils/endUserData';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';

export default class EndUserApiSteps {
  static registeredUser = null;

  static createEndUser() {
    const endUser = generateRandomEndUser();
    EndUserApiSteps.registeredUser = endUser;
    return createIDMUser({
      userName: endUser.username,
      givenName: endUser.firstName,
      sn: endUser.lastName,
      mail: endUser.emailAddress,
      password: endUser.password,
    });
  }

  static loginAsEndUser() {
    const { username, password, firstName } = EndUserApiSteps.registeredUser;
    cy.loginAsEnduser(username, password, true, undefined, firstName);
  }

  static registerViaJourney(journey) {
    const endUser = generateRandomEndUser();
    EndUserApiSteps.registeredUser = endUser;
    cy.registerViaJourney(generateJourneyURL(journey.name), endUser);
  }

  static getRegisteredUser() {
    const { username } = EndUserApiSteps.registeredUser;
    const objectType = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return cy.request({
      method: 'GET',
      url: `https://${Cypress.env('FQDN')}/openidm/managed/${objectType}?_queryFilter=userName+eq+"${username}"`,
      headers: { authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}` },
    }).then(({ body }) => body.result[0]);
  }

  static triggerUpdateRegisteredUser() {
    const { username } = EndUserApiSteps.registeredUser;
    const objectType = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return cy.request({
      method: 'GET',
      url: `https://${Cypress.env('FQDN')}/openidm/managed/${objectType}?_queryFilter=userName+eq+"${username}"&_fields=_id`,
      headers: { authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}` },
    }).then(({ body }) => {
      const id = body.result?.[0]?._id;
      return cy.request({
        method: 'PATCH',
        url: `https://${Cypress.env('FQDN')}/openidm/managed/${objectType}/${id}`,
        headers: {
          authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
          'content-type': 'application/json',
        },
        body: [{ operation: 'replace', field: 'preferences/updates', value: true }],
      });
    });
  }

  static deleteRegisteredUser() {
    return cy.wrap(null).then(() => {
      const { username } = EndUserApiSteps.registeredUser || {};
      if (!username) return null;

      const objectType = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
      return cy.request({
        method: 'GET',
        url: `https://${Cypress.env('FQDN')}/openidm/managed/${objectType}?_queryFilter=userName+eq+"${username}"&_fields=_id`,
        headers: { authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}` },
        failOnStatusCode: false,
      }).then(({ body }) => {
        const id = body.result?.[0]?._id;
        if (id) {
          return deleteIDMUser(id).then(() => {
            EndUserApiSteps.registeredUser = null;
          });
        }
        return null;
      });
    });
  }
}
