/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

/**
  * Returns role metrics
  * @returns {Promise}
  */
export async function getRoleMetrics() {
  return generateIgaApi().get('/governance/role/metrics');
}

/**
  * Run the role mining job
  * @returns {Promise}
  */
export async function launchRoleMiningJob() {
  return generateIgaApi().post('/governance/jobs/roleMining?_action=trigger');
}
