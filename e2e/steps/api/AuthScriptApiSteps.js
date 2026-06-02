/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createScript, deleteScript } from '@e2e/api/scriptApi.e2e';

export default class AuthScriptApiSteps {
  static createdScriptIds = [];

  static createdLibraryScriptIds = [];

  static trackCreatedScript({ _id, context }) {
    if (context === 'LIBRARY') {
      AuthScriptApiSteps.createdLibraryScriptIds.push(_id);
    } else {
      AuthScriptApiSteps.createdScriptIds.push(_id);
    }
  }

  static interceptCreatedScripts() {
    cy.intercept('POST', '**/scripts/?_action=create', (req) => {
      req.continue((res) => {
        if (res.statusCode === 201 && res.body._id) {
          AuthScriptApiSteps.trackCreatedScript(res.body);
        }
      });
    }).as('createScript');
  }

  static createScript(scriptData) {
    return createScript(scriptData).then(({ body }) => {
      AuthScriptApiSteps.trackCreatedScript(body);
      return body;
    });
  }

  // Scripts that use a library must be deleted before the library, otherwise the backend rejects the library deletion
  static deleteCreatedScripts() {
    return cy.wrap(AuthScriptApiSteps.createdScriptIds).each((id) => deleteScript(id)).then(() => {
      AuthScriptApiSteps.createdScriptIds = [];
    }).then(() => cy.wrap(AuthScriptApiSteps.createdLibraryScriptIds).each((id) => deleteScript(id)).then(() => {
      AuthScriptApiSteps.createdLibraryScriptIds = [];
    }));
  }
}
