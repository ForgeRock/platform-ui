/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Replaces placeholders in a JSON object with the specified replacement strings.
 *
 * @param {Object} jsonObject - The JSON object containing placeholders.
 * @param {Object} replaceStrings - An object containing the replacement strings.
 * @returns {Object} The JSON object with placeholders replaced.
 */
// eslint-disable-next-line import/prefer-default-export
export function replacePlaceholders(jsonObject, replaceStrings) {
  let strigifiedObject = JSON.stringify(jsonObject);
  Object.entries(replaceStrings).forEach(([keyToFind, valueToReplace]) => {
    const replaceString = new RegExp(keyToFind, 'g');
    strigifiedObject = strigifiedObject.replace(replaceString, valueToReplace);
  });

  return JSON.parse(strigifiedObject);
}
