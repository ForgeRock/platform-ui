/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';
import admin from '../../../../persona/adminSteps';

describe('Login page - focus highlight', { tags: ['@cloud'] }, () => {
  retryableBeforeEach(() => {
    admin.loginPage.visit();
  });

  it('[C19302] Login page - Highlight color in elements', () => {
    const focusColors = { buttonLinkColors: [], inputColors: [] };

    admin.loginPage.collectFocusHighlights(focusColors);
    admin.loginPage.assertSharedFocusColors(focusColors);
  });
});
