/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const ESV_ALL = 'fr:idc:esv:*';

// Note: these are the specific scopes available for ESVs
const ESV_SUB_SCOPES = [
  'fr:idc:esv:read',
  'fr:idc:esv:update',
  'fr:idc:esv:restart',
];

/**
 * Returns a new list minus any ESV_SUB_SCOPES
 * @param {Array} scopes list
 * @returns new list without `fr:idc:esv:read`, `fr:idc:esv:update` or `fr:idc:esv:restart`
 */
const removeEsvSubScopes = (scopes) => {
  if (!scopes) throw Error('Something went wrong. No scopes found.');
  if (!Array.isArray(scopes) || scopes.length === 0) throw Error('Something went wrong, pleaser provide valid list of scopes.');

  return scopes.filter((scope) => !ESV_SUB_SCOPES.includes(scope));
};

const includesAll = (list1, list2) => (list1.every((v) => list2.includes(v)));

/**
 * Creates a list of scopes removing empty scopes/duplicates for saving
 * @param {Array} scopes user selected scopes to combine with the mantatory
 * @returns the list of scopes
 */
function buildScopes(scopes) {
  if (!scopes) throw Error('Something went wrong. No scopes found.');
  if (!Array.isArray(scopes) || scopes.length === 0) throw Error('Something went wrong, pleaser provide valid list of scopes.');

  const nonEmptyScopes = scopes.filter((scope) => scope); // Note: removing any empty strings

  const containsEsvAll = nonEmptyScopes.find((scope) => scope === ESV_ALL);
  if (containsEsvAll) {
    // Note: we need to remove any specific esv scopes  when the user has provided `ESV_ALL`
    return removeEsvSubScopes(nonEmptyScopes);
  }

  const esvSubScopes = nonEmptyScopes.filter((scope) => ESV_SUB_SCOPES.includes(scope));
  const containsAllSubScopes = includesAll(ESV_SUB_SCOPES, esvSubScopes);
  if (containsAllSubScopes) {
    // Note: if all three sub scopes are selected, we want to replace them with `ESV_ALL`
    const scopesWithouEsvSubScopes = removeEsvSubScopes(nonEmptyScopes);
    scopesWithouEsvSubScopes.push(ESV_ALL);
    return scopesWithouEsvSubScopes;
  }

  return nonEmptyScopes;
}

const isParsableObject = (json) => {
  const firstChar = json.charAt(0);
  const lastChar = json.charAt(json.length - 1);
  return (firstChar === '{' && lastChar === '}');
};

/**
 * Parses the given JSON and returns the public key
 * when a key is saved or loaded it is serialized to json, it is necessary to parse it in order to display the public key on the front end
 * @param {String} jwks a JSON serialized String
 * @returns the public key field from the parsed jwks object
 */
function getPublicKey(jwks) {
  if (!jwks) throw Error('Please provide a valid json web key set');
  if (typeof jwks !== 'string' || !isParsableObject(jwks)) throw Error('Please provide a valid parsable string');

  const parsedJwks = JSON.parse(jwks);
  if (!parsedJwks.n) throw Error('No public key found for given JSON');
  return parsedJwks.n; // the public key
}

export { removeEsvSubScopes, buildScopes, getPublicKey };
