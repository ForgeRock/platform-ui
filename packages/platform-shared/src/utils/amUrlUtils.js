/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';

/**
 * Strips leading slashes from a realm string and falls back to 'root'.
 * Needed for buildWellknownUrl, where the realm is interpolated into the
 * URL path and a leading slash would produce a double slash.
 * @param {string} realm
 * @returns {string}
 */
export function normalizeRealm(realm) {
  const result = (realm || 'root').replace(/^\/+/, '') || 'root';
  return result;
}

export function buildWellknownUrl(realm) {
  const base = store.state.SharedStore.amBaseURL.replace(/\/+$/, '');
  return new URL(`oauth2/realms/${realm}/.well-known/openid-configuration`, `${base}/`).href;
}

export function buildAmBaseUrl() {
  return store.state.SharedStore.amBaseURL;
}
