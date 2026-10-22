/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const reentryTokenName = 'reentry';
const resumeDataKey = 'treeResumeData';
const authResumptionParams = ['state', 'code', 'scope', 'form_post_entry', 'responsekey'];

/**
 * Returns boolean true if reentry cookie is set
 * @returns {Boolean}
 */
function hasReentryToken() {
  return !!document.cookie
    .split('; ')
    .find((row) => row.startsWith(reentryTokenName));
}

/**
 * Clears the reentry token by updating the cookie to expire in the past
 */
function clearReentryToken() {
  const date = new Date();
  date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
  document.cookie = `reentry="";expires="${date.toGMTString()}";path=/`;
}

/**
 * Determines whether the passed url parameters contain any of the queries indicating a tree is being resumed
 * @param {URLSearchParams} urlParams the query parameters for the current login session
 * @returns {Boolean} whether the passed urlParams include any resumption query parameters
 */
function doURLParamsContainAnyResumptionParameter(urlParams) {
  const paramKeyArray = Array.from(urlParams.keys());
  return paramKeyArray.some((queryParam) => authResumptionParams.includes(queryParam));
}

/**
 * Checks whether any resumption data has been stored
 * @returns {Boolean} whether any resumption data is present in browser storage
 */
function isResumeDataPresentInStorage() {
  return localStorage.getItem(resumeDataKey) !== null;
}

/**
 * Reduces a realm to a comparable form, so that '/alpha' and 'alpha' match and '/', '' and 'root' all mean the root realm
 * @param {String} realm a realm as found in a url or in stored resumption data
 * @returns {String} the realm without surrounding slashes, or 'root'
 */
function normalizeRealmForComparison(realm) {
  return (realm || '').replace(/^\/+|\/+$/g, '') || 'root';
}

/**
 * Reads the realm that was stored alongside the resumption data
 * @returns {String|null} the realm the resumption data was stored from, or null if it is unavailable
 */
function getRealmOfStoredResumeData() {
  try {
    return JSON.parse(localStorage.getItem(resumeDataKey))?.realmAtRedirect || null;
  } catch {
    return null;
  }
}

/**
 * Determines whether the stored resumption data was saved from a different realm to the one in the url.
 * All realms on a tenant share one domain and so one localStorage, meaning data stored by one realm can be seen by another (IAM-10763).
 * When the url has no realm (IAM-4533) or the stored data has no realm, ownership cannot be determined so the data is treated as belonging to this realm
 * @param {String} urlRealm the value of the realm query parameter, if there was one
 * @returns {Boolean} whether the stored resumption data belongs to a different realm
 */
function isResumeDataFromAnotherRealm(urlRealm) {
  if (!urlRealm) return false;
  const storedRealm = getRealmOfStoredResumeData();
  if (!storedRealm) return false;
  return normalizeRealmForComparison(storedRealm) !== normalizeRealmForComparison(urlRealm);
}

/**
 * Determines whether the passed url parameters and browser storage indicate that a tree is being resumed following a redirect
 * @param {URLSearchParams} urlParams the query parameters for the current login session
 * @param {String} [urlRealm] the value of the realm query parameter, if there was one. Resumption data stored by a different realm is ignored
 * @returns {Boolean} whether a tree should be resumed
 */
function resumingTreeFollowingRedirect(urlParams, urlRealm) {
  // The AM XUI just checks for a reentry token and data in browser storage here. The check against query parameters should not be needed but are left for extra security
  return (doURLParamsContainAnyResumptionParameter(urlParams) || hasReentryToken())
    && isResumeDataPresentInStorage()
    && !isResumeDataFromAnotherRealm(urlRealm);
}

/**
 * Determines whether the passed route name and url parameters indicate that we're resuming a suspended tree
 * @param {String} routeName the name of the current route
 * @param {URLSearchParams} urlParams the query parameters for the current login session
 */
function resumingSuspendedTree(routeName, urlParams) {
  return routeName === 'login' && urlParams.has('suspendedId');
}

/**
 * Adds data for resuming a tree into browser storage for later retrieval to resume a tree
 * @param {Step} step the SDK step to store
 */
function addTreeResumeDataToStorage(step, realmAtRedirect) {
  const storeData = {
    realmAtRedirect,
    step,
  };
  localStorage.setItem(resumeDataKey, JSON.stringify(storeData));
}

/**
 * Loads tree resumption data from browser storage and removes it, also clearing the tracking cookie
 * @returns {Object} an object containing the url at redirect, and the sdk step for resuming a tree
 */
function getResumeDataFromStorageAndClear() {
  const resumeData = localStorage.getItem(resumeDataKey);
  const parsed = resumeData ? JSON.parse(resumeData) : null;
  localStorage.removeItem(resumeDataKey);
  clearReentryToken();

  return parsed;
}

export {
  hasReentryToken,
  clearReentryToken,
  doURLParamsContainAnyResumptionParameter,
  isResumeDataPresentInStorage,
  resumingTreeFollowingRedirect,
  resumingSuspendedTree,
  addTreeResumeDataToStorage,
  getResumeDataFromStorageAndClear,
};
