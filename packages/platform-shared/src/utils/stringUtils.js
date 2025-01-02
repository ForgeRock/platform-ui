/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import formatNumber from './formatNumber';

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

/**
 * Formats a number by replacing thousands with the letter 'K'.
 *
 * @param {number} num - The number to format.
 * @returns {string} The formatted string with 'K' for thousands or the original number as a string if less than 1000.
 */
export function formatThousands(num) {
  if (num >= 1000) {
    return `${formatNumber((num / 1000).toFixed(1).replace(/\.0$/, ''))}K`;
  }
  return num.toString();
}
