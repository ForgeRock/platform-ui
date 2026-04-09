/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

/**
  * Returns email notification templates
  * @returns {Promise}
  */
// eslint-disable-next-line import/prefer-default-export
export async function getEmailNotificationTemplates() {
  return generateIgaApi().get('/governance/notification');
}
