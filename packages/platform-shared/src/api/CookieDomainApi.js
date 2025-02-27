/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateFraasEnvironmentApi } from './BaseApi';

export function getCookieDomains() {
  return generateFraasEnvironmentApi().get('/cookie-domains');
}

export function updateCookieDomains(cookieDomains) {
  return generateFraasEnvironmentApi().put('/cookie-domains', { domains: [...cookieDomains] });
}
