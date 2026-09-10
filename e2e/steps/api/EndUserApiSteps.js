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

  static registerViaJourney(journey, userData = {}) {
    const endUser = generateRandomEndUser();
    EndUserApiSteps.registeredUser = endUser;
    cy.registerViaJourney(generateJourneyURL(journey.name), { ...endUser, ...userData });
  }

  static getRegisteredUser() {
    const { username } = EndUserApiSteps.registeredUser;
    const objectType = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return cy.request({
      method: 'GET',
      url: `https://${Cypress.env('FQDN')}/openidm/managed/${objectType}?_queryFilter=userName+eq+"${username}"`,
      headers: { authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}` },
    }).then(({ body }) => body.result[0] ?? null);
  }

  static assertRegisteredUserHas(attribute, value) {
    return EndUserApiSteps.getRegisteredUser().its(attribute).should('eq', value);
  }

  static assertRegisteredUserDoesNotExist() {
    return EndUserApiSteps.getRegisteredUser().should('be.null');
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
        if (!id) return null;

        const deleteWithRetry = (retries = 10) => deleteIDMUser(id, false).then((response) => {
          if (response.status === 500 && retries > 0) {
            // IDM applies managed-config changes (e.g. removing an event hook) asynchronously;
            // a DELETE issued right after cleanup can still be evaluated against the previous
            // config, where the hook script throws and IDM answers 500 Access Denied.
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            return cy.wait(3000).then(() => deleteWithRetry(retries - 1));
          }
          EndUserApiSteps.registeredUser = null;
          if (!response.isOkStatusCode) {
            throw new Error(`Failed to delete registered user ${username} (${id}) — status ${response.status}, user left on tenant`);
          }
          return response;
        });
        return deleteWithRetry();
      });
    });
  }
}
