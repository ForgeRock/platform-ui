/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import commonAdminSteps from '@e2e/steps/commonAdminSteps';
import LoginSteps from '../steps/login/LoginSteps';

export default {
  ...commonAdminSteps,
  loginPage: LoginSteps,
};
