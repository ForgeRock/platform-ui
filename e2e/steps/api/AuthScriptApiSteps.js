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

  static interceptCreatedScripts() {
    cy.intercept('POST', '**/scripts/?_action=create', (req) => {
      req.continue((res) => {
        if (res.statusCode === 201 && res.body._id) {
          AuthScriptApiSteps.createdScriptIds.push(res.body._id);
        }
      });
    }).as('createScript');
  }

  static createScript(scriptData) {
    return createScript(scriptData).then(({ body }) => {
      AuthScriptApiSteps.createdScriptIds.push(body._id);
      return body;
    });
  }

  static deleteCreatedScripts() {
    return cy.wrap(AuthScriptApiSteps.createdScriptIds).then((ids) => {
      if (!ids.length) return null;
      return cy.wrap(ids).each((id) => deleteScript(id)).then(() => {
        AuthScriptApiSteps.createdScriptIds = [];
      });
    });
  }
}
