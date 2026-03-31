/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Canonical identity for a column. Prefer `value` (typically `category.key`),
 * fall back to `key`. Returns an empty string for nullish input so callers
 * can compare safely.
 *
 * @param {Object} col - The column object.
 * @returns {String} The column's id.
 */
// eslint-disable-next-line import/prefer-default-export
export function getColumnId(col) {
  return col?.value ?? col?.key ?? '';
}
