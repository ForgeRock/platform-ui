/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  createRealm, deleteRealm, setRealmActive,
} from '@e2e/api/realmApi.e2e';

export default class RealmApiSteps {
  static createdRealmNames = [];

  static deactivatedRealmNames = [];

  static createRealm(realmName) {
    return createRealm(realmName).then((response) => {
      RealmApiSteps.createdRealmNames.push(realmName);
      return response;
    });
  }

  static deactivateRealm(realmName) {
    RealmApiSteps.deactivatedRealmNames.push(realmName);
    return setRealmActive(realmName, false);
  }

  static reactivateCreatedRealms() {
    const allToReactivate = [
      ...RealmApiSteps.createdRealmNames,
      ...RealmApiSteps.deactivatedRealmNames,
    ];
    return cy.wrap(allToReactivate).then((names) => {
      names.forEach((name) => {
        setRealmActive(name, true, { failOnStatusCode: false });
      });
      RealmApiSteps.deactivatedRealmNames = [];
    });
  }

  static deleteCreatedRealms() {
    return cy.wrap(RealmApiSteps.createdRealmNames).then((names) => {
      if (!names.length) return null;
      names.forEach((name) => {
        deleteRealm(name, { failOnStatusCode: false });
      });
      RealmApiSteps.createdRealmNames = [];
      return null;
    });
  }
}
