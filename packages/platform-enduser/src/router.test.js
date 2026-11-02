/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import reportViewGuard from '@forgerock/platform-shared/src/views/Reports/utils/reportViewGuard';
import router from './router';

describe('enduser router', () => {
  it('keeps reportViewGuard as the ReportView route beforeEnter', () => {
    const reportViewRoute = router.getRoutes().find((route) => route.name === 'ReportView');

    expect(reportViewRoute).toBeDefined();
    expect(reportViewRoute.beforeEnter).toBe(reportViewGuard);
  });
});
