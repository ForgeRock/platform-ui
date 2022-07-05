/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * The scopes we always want Service Accounts to have
 */
const defaultScopes = [
  'fr:idm*',
  'fr:am*',
];

/**
 * Creates a list of scopes combining the mandatory scopes and the provided scopes
 * @param {*} scopes user selected scopes to combine with the mantatory
 * @returns the combined list
 */
function buildScopes(scopes) {
  if (!scopes) throw Error('Something went wrong. No scopes found');

  const filteredScopes = scopes.filter((scope) => scope); // Note: removing any empty strings
  return [
    ...defaultScopes,
    ...filteredScopes,
  ];
}

export default buildScopes;
