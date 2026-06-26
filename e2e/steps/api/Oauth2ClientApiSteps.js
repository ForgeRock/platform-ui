/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createOAuth2Client, deleteOAuth2Client } from '@e2e/api/applicationsApi.e2e';

export default class Oauth2ClientApiSteps {
  static createdClientIds = [];

  static createOAuth2Client(clientId, clientName) {
    return createOAuth2Client(clientId, clientName).then(() => {
      Oauth2ClientApiSteps.createdClientIds.push(clientId);
    });
  }

  static deleteCreatedClients() {
    return cy.wrap(null).then(() => {
      const clientIds = [...Oauth2ClientApiSteps.createdClientIds];
      Oauth2ClientApiSteps.createdClientIds = [];
      if (!clientIds.length) return cy.wrap(null);
      return cy.wrap(clientIds).each((id) => deleteOAuth2Client(id).then((response) => {
        if (!response.isOkStatusCode) {
          throw new Error(`Failed to delete OAuth2 client ${id} — tenant may be in a dirty state. Status: ${response.status}`);
        }
      }));
    });
  }
}
