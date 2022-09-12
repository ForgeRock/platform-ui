/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { words, capitalize } from 'lodash';

/**
 * Capitalizes first letter of each word delimited with hyphens
 * eg. familias-spurius will be fomatted to Familias-Spurius
 */
function startCaseHyphenated(text) {
  return words(text, /[^-]+/g).reduce((result, word, index) => (
    result + (index ? '-' : '') + capitalize(word)
  ), '');
}

/**
 * Returns text with first letter of each word capitalized keeping the special characters. Uses space and hyphen as delimiters.
 * Used to format users full name.
 */
export default function startCase(text) {
  return words(text, /[^\s]+/g).reduce((result, word, index) => (
    result + (index ? ' ' : '') + startCaseHyphenated(word)
  ), '');
}
