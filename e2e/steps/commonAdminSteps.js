/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import LoginSteps from './admin/AdminLoginSteps';
import BrowserSteps from './admin/BrowserSteps';
import NavigationSteps from './admin/NavigationSteps';
import ThemeSteps from './admin/ThemeSteps';

export default {
  login: LoginSteps,
  browser: BrowserSteps,
  navigation: NavigationSteps,
  theme: ThemeSteps,
};
