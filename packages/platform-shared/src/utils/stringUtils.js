/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
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

/**
 * Helper to clean a PEM formatted certificate string.
 * @param {string} pem - The PEM formatted certificate.
 * @returns {string} The cleaned certificate string without headers, footers, and newlines.
 */
export function stripPemCertificateHeaders(pem) {
  return pem?.replace('-----BEGIN CERTIFICATE-----', '')
    .replace('-----END CERTIFICATE-----', '')
    .replaceAll('\n', '') || '';
}

/**
 * Normalizes message text by removing newlines immediately before and/or after <br> tags.
 * This prevents double line breaks when rendering with CSS white-space: pre-line.
 *
 * When customers write messages with <br> tags and format them on multiple lines,
 * both the <br> and the \n create line breaks, resulting in unwanted double spacing.
 * This function removes newlines adjacent to <br> tags to ensure consistent single line breaks.
 *
 * Examples:
 * - "Line 1<br>\nLine 2" → "Line 1<br>Line 2" (single line break)
 * - "Line 1\n<br>Line 2" → "Line 1<br>Line 2" (single line break)
 * - "Line 1\n<br>\nLine 2" → "Line 1<br>Line 2" (single line break)
 * - "Para 1\n\nPara 2" → unchanged (intentional paragraph spacing preserved)
 * - "Line 1<br>\n\nLine 2" → "Line 1<br>\nLine 2" (one blank line preserved)
 *
 * @param {string} message - The message text to normalize.
 * @returns {string} The normalized message with newlines around <br> tags removed.
 */
export function normalizeMessageLineBreaks(message) {
  if (!message || typeof message !== 'string') {
    return message;
  }
  // Remove single newline before and/or after <br> tags
  // \n? matches optional newline before <br>
  // <br\s*\/?>  matches <br>, <br/>, <br />, <BR> (case-insensitive)
  // [ \t]* matches optional spaces/tabs after tag
  // \n? matches optional newline after tag
  return message.replace(/\n?<br\s*\/?>[ \t]*\n?/gi, '<br>');
}
