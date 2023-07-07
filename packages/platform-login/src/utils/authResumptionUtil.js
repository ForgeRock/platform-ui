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
function addTreeResumeDataToStorage(step, urlAtRedirect) {
  const storeData = {
    urlAtRedirect,
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

/**
 * Determines whether a new auth URL has any extra (or altered) query parameters compared to a reference URL
 * @param {String} oldUrl old authentication URL to use as a reference
 * @param {String} newUrl new authentication URL to check against the old URL
 * @returns {Boolean} whether the two URLs are functionally equivalent
 */
function doesNewAuthUrlContainExtraQueryParams(oldUrl, newUrl) {
  const oldUrlSearch = new URLSearchParams(new URL(oldUrl).search);
  const newUrlSearch = new URLSearchParams(new URL(newUrl).search);

  // The AM server is authoritative on trees and realms, so we can discount realm and tree query parameters
  oldUrlSearch.delete('realm');
  newUrlSearch.delete('realm');
  if (oldUrlSearch.get('authIndexType') === 'service') {
    oldUrlSearch.delete('authIndexType');
    oldUrlSearch.delete('authIndexValue');
  }
  if (newUrlSearch.get('authIndexType') === 'service') {
    newUrlSearch.delete('authIndexType');
    newUrlSearch.delete('authIndexValue');
  }

  const newUrlSearchSize = Array.from(newUrlSearch.keys()).length;
  const oldUrlSearchSize = Array.from(oldUrlSearch.keys()).length;

  // If the new URL has extra query parameters it indicates it has returned from redirect with extra information and we want to resume
  if (newUrlSearchSize > oldUrlSearchSize) return true;

  // If there are the same number of parameters, check if they have changed
  let queryParamsMatch = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of oldUrlSearch) {
    queryParamsMatch = value === newUrlSearch.get(key);
    if (queryParamsMatch === false) break;
  }

  return !queryParamsMatch;
}

/**
 * Determines whether the tree resumption should be aborted.
 * We don't want to resume if it looks like the user has returned to or switched tree,
 * rather than continuing with their redirect. This could happen if the user has clicked
 * back in the browser (IAM-2927) or used a link or their URL bar to return to the platform-login
 * without data to continue the tree.
 * @param {String} urlAtRedirect auth URL when the user was redirected away from platform-login
 * @param {String} urlAtResume auth URL when the user resumed a tree with from platform-login
 * @returns {Boolean} whether the current tree resume operation is invalid and should be aborted
 */
function shouldAbortResume(urlAtRedirect, urlAtResume) {
  const returnUrlHasExtraData = doesNewAuthUrlContainExtraQueryParams(urlAtRedirect, urlAtResume);

  // Abort resume if there are no extra params in the return URL
  return !returnUrlHasExtraData;
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
  doesNewAuthUrlContainExtraQueryParams,
  shouldAbortResume,
};
