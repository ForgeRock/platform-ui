/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
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
 * Determines whether the passed url parameters and browser storage indicate that a tree is being resumed following a redirect
 * @param {URLSearchParams} urlParams the query parameters for the current login session
 * @returns {Boolean} whether a tree should be resumed
 */
function resumingTreeFollowingRedirect(urlParams) {
  // The AM XUI just checks for a reentry token and data in browser storage here. The check against query parameters should not be needed but are left for extra security
  return (doURLParamsContainAnyResumptionParameter(urlParams) || hasReentryToken()) && isResumeDataPresentInStorage();
}

/**
 * Determines whether the passed route name and url parameters indicate that we're resuming a suspended tree
 * @param {String} routeName the name of the current route
 * @param {URLSearchParams} urlParams the query parameters for the current login session
 */
function resumingSuspendedTree(routeName, urlParams) {
  return routeName === 'login' && urlParams.has('suspendedId') && urlParams.has('authIndexValue');
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
  localStorage.removeItem(resumeDataKey);
  clearReentryToken();

  return JSON.parse(resumeData);
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
