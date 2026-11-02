/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getReportRuns } from '@forgerock/platform-shared/src/api/AutoApi';
import store from '@/store';

/**
 * Vue Router `beforeEnter` guard for the ReportView route: redirects to the Forbidden page when
 * the current user cannot fetch the report run (request rejects or `result` is empty/missing).
 * @param {Object} to target route; uses `to.params.state`, `to.params.template` and `to.params.id`
 * @param {Object} from previous route (unused)
 * @param {Function} next router completion callback; called exactly once
 */
export default async function reportViewGuard(to, from, next) {
  try {
    const { result } = await getReportRuns({
      name: to.params.template,
      realm: store.state.realm,
      runId: to.params.id,
      templateType: to.params.state,
    });
    if (result?.length) {
      next();
    } else {
      next({ name: 'Forbidden' });
    }
  } catch {
    // Fail closed: an unhandled rejection here would leave the view stuck on its skeleton loader
    next({ name: 'Forbidden' });
  }
}
