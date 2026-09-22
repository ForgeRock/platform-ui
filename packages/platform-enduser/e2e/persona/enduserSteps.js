/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import commonEnduserSteps from '@e2e/steps/commonEnduserSteps';
import KeyboardNavigationSteps from '../steps/enduser/KeyboardNavigationSteps';

export default {
  ...commonEnduserSteps,
  keyboardNavigation: KeyboardNavigationSteps,
};
