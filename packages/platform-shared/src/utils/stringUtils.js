/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Replaces placeholders in a JSON object or String with the specified replacement strings.
 *
 * @param {Object|String} val - The JSON object or string containing placeholders.
 * @param {Object} replaceStrings - An object containing the replacement strings.
 * @returns {Object|String} The JSON object with placeholders replaced.
 */
// eslint-disable-next-line import/prefer-default-export
export function replacePlaceholders(val, replaceStrings) {
  const isString = typeof val === 'string';
  let stringifiedObject = isString ? val : JSON.stringify(val);
  Object.entries(replaceStrings).forEach(([keyToFind, valueToReplace]) => {
    const replaceString = new RegExp(keyToFind, 'g');
    stringifiedObject = stringifiedObject.replace(replaceString, valueToReplace);
  });

  return isString ? stringifiedObject : JSON.parse(stringifiedObject);
}
