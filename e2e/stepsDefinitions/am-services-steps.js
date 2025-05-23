/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  deleteSessionService,
  createSessionService,
  getSessionService,
} from '@e2e/api/amConsoleServicesApi.e2e';
import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('session service in AM console is added via API with following params', (dataTable) => {
  getSessionService().then((getResponse) => {
    if (getResponse.status === 200) {
      delete getResponse.body._rev;
      deleteSessionService(getResponse.body).then((deleteResponse) => {
        expect(deleteResponse.status).to.equal(200);
      });
    }
    const sessionParams = {};
    dataTable.hashes().forEach((row) => {
      sessionParams[row.Param.replace(/\s/g, '')] = parseInt(row.Value, 10);
    });
    createSessionService(sessionParams).then((createResponse) => {
      expect(createResponse.status).to.equal(201);
    });
  });
});
