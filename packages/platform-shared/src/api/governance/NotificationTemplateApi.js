/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

/**
  * Returns email notification templates
  * @param {Object} [options]
  * @param {String} [options.context] When set, only returns templates whose id
  *   starts with this prefix (e.g. 'certification'). Requires backend support
  *   (IGA-4704); servers without it ignore the param and return all templates.
  * @returns {Promise}
  */
export async function getEmailNotificationTemplates(options = {}) {
  return generateIgaApi().get('/governance/notification', { params: options.context ? { context: options.context } : {} });
}
