/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateFraasEnvironmentApi } from './BaseApi';

export function getCookieName() {
  return generateFraasEnvironmentApi().get('/sso-cookie');
}

export function resetCookieName() {
  return generateFraasEnvironmentApi().post('/sso-cookie?_action=reset');
}

export function updateCookieName(cookieName) {
  return generateFraasEnvironmentApi().put('/sso-cookie', { name: cookieName });
}
