/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

/**
  * Returns email notification templates
  * @returns {Promise}
  */
export async function getEmailNotificationTemplates() {
  return generateIgaApi().get('/governance/notification');
}
