/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  getDefaultProviderConfig,
  putEmailProviderConfig,
} from '@e2e/api/emailApi.e2e';

export default class EmailProviderApiSteps {
  static savedDefaultConfig = null;

  static backupAndResetToDefault() {
    return getDefaultProviderConfig().then((config) => {
      EmailProviderApiSteps.savedDefaultConfig = config.body;
      return putEmailProviderConfig(config.body);
    });
  }

  static restoreDefault() {
    if (!EmailProviderApiSteps.savedDefaultConfig) return;
    putEmailProviderConfig(EmailProviderApiSteps.savedDefaultConfig);
  }

  static setProvider(config) {
    return putEmailProviderConfig(config).then((result) => {
      expect(result.status).to.equal(200);
    });
  }

  static interceptSendEmail() {
    cy.intercept('POST', '/openidm/external/email/?_action=send').as('sendEmail');
  }
}
