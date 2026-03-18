/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getDirectives, addDirective, deleteDirectives, setActivationStatus,
} from '@e2e/api/cspApi.e2e';

export default class CspApiSteps {
  static createdDirectiveNames = [];

  static getDirectives() {
    return getDirectives();
  }

  static addDirective(directiveName, sources) {
    return addDirective(directiveName, sources).then((response) => {
      CspApiSteps.createdDirectiveNames.push(directiveName);
      return response;
    });
  }

  static deleteCreatedDirectives() {
    return cy.wrap(CspApiSteps.createdDirectiveNames).then((directiveNames) => {
      if (!directiveNames.length) return null;

      return deleteDirectives(directiveNames).then(() => {
        CspApiSteps.createdDirectiveNames = [];
      });
    });
  }

  static activatePolicy() {
    return setActivationStatus(true);
  }

  static deactivatePolicy() {
    return setActivationStatus(false);
  }
}
