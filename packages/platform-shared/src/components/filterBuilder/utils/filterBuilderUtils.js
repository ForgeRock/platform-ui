/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Locates group within path to add or update
 *
 * @property {Object} filter - Current layer of query filter
 * @property {String} paths - Path of current filter in relation to entire query filter
 * @property {number} pathIndex - How far into group we have searched
 * @property {Boolean} depth - How deep the query filter is
 *
 * @returns {Object} Group within query filter that path points to
 */
export function findGroup(filter, paths, pathIndex, depth) {
  if (depth === 0) return filter;
  if (pathIndex === 0) return findGroup(filter, paths, pathIndex + 1, depth);

  const subfilter = filter.subfilters[paths[pathIndex]];

  if (pathIndex === depth) return subfilter;
  return findGroup(subfilter, paths, pathIndex + 1, depth);
}

/**
 * Determines if current filter string has a depth greater than our max allowed
 * depth for the basic editor. We also ignore 'not' parenthesis.
 * NOTE: Need to use basic for loop, as forEach is not available for strings
 *
 * @property {string} queryFilterString - stringified query filter
 *
 * @returns {Boolean} Whether current query filter is three layers of depth or less
 */
export function checkIfWithinThreeLayers(queryFilterString, maxDepth) {
  const testString = queryFilterString.replace(/\\"/g, '').replace(/"[^"]*"/g, '');
  let depth = 0;
  let ignoreNots = 0;
  let withinThreeLayers = true;
  for (let index = 0; index < testString.length; index += 1) {
    if (testString[index] === '(') {
      if (index > 0 && testString.charAt(index - 1) === '!') {
        ignoreNots += 1;
      } else {
        depth += 1;
        if (depth > maxDepth) {
          withinThreeLayers = false;
        }
      }
    } else if (testString.charAt(index) === ')') {
      if (ignoreNots) {
        ignoreNots -= 1;
      } else {
        depth -= 1;
      }
    }
  }
  return withinThreeLayers;
}
