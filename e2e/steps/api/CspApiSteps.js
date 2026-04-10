/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  getDirectives, addDirective, deleteDirectives, setActivationStatus,
} from '@e2e/api/cspApi.e2e';

export default class CspApiSteps {
  static createdDirectiveNames = [];

  static createdEnforcedDirectiveNames = [];

  static getDirectives(isEnforced = false) {
    return getDirectives(isEnforced);
  }

  static addDirective(directiveName, sources) {
    return addDirective(directiveName, sources, false).then((response) => {
      CspApiSteps.createdDirectiveNames.push(directiveName);
      return response;
    });
  }

  static addEnforcedDirective(directiveName, sources) {
    return addDirective(directiveName, sources, true).then((response) => {
      CspApiSteps.createdEnforcedDirectiveNames.push(directiveName);
      return response;
    });
  }

  static deleteCreatedDirectives() {
    return cy.wrap(null).then(() => {
      const reportOnlyPromise = CspApiSteps.createdDirectiveNames.length
        ? deleteDirectives(CspApiSteps.createdDirectiveNames, false).then(() => {
          CspApiSteps.createdDirectiveNames = [];
        })
        : cy.wrap(null);

      const enforcedPromise = CspApiSteps.createdEnforcedDirectiveNames.length
        ? deleteDirectives(CspApiSteps.createdEnforcedDirectiveNames, true).then(() => {
          CspApiSteps.createdEnforcedDirectiveNames = [];
        })
        : cy.wrap(null);

      return reportOnlyPromise.then(() => enforcedPromise);
    });
  }

  static activateReportOnlyPolicy() {
    return setActivationStatus(true, false);
  }

  static deactivateReportOnlyPolicy() {
    return setActivationStatus(false, false);
  }

  static activateEnforcedPolicy() {
    return setActivationStatus(true, true);
  }

  static deactivateEnforcedPolicy() {
    return setActivationStatus(false, true);
  }
}
