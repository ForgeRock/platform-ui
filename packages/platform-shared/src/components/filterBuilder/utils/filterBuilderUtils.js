/**
 * Copyright (c) 2022-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const filterFieldMap = {
  starts_with: 'value',
  not_starts_with: 'value',
  ends_with: 'value',
  has_changed: 'left',
  has_not_changed: 'left',
  not_ends_with: 'value',
  equals: 'left',
  not_equals: 'left',
  gte: 'left',
  gt: 'left',
  lte: 'left',
  lt: 'left',
  contains: 'in_string',
  not_contains: 'in_string',
};
const filterValueMap = {
  starts_with: 'prefix',
  not_starts_with: 'prefix',
  ends_with: 'suffix',
  not_ends_with: 'suffix',
  equals: 'right',
  not_equals: 'right',
  gte: 'right',
  gt: 'right',
  lte: 'right',
  lt: 'right',
  contains: 'search_string',
  not_contains: 'search_string',
};
const operatorMap = {
  has_changed: 'not_equals',
  has_not_changed: 'equals',
};

/**
 * Converts filter from shared filter builder format to IGA format
 * {
 *   operator: 'or',
 *   subfilters: [
 *     {
 *       field: 'sn',
 *       operator: 'starts_with',
 *       value: 'koya',
 *       temporalValue: 'before',
 *     },
 *   ],
 * },
 * {
 *   or: [
 *     {
 *       starts_with: {
 *         prefix: {
 *           literal: 'koya',
 *         },
 *         value: 'user.before.sn',
 *       },
 *     },
 *   ],
 * },
 * @param {Object} filter component filter to convert
 * @param {String} resourceName name of resource filter is aimed against
 * @param {Array} properties list of properties available
 */
export function convertToIGAFilter(filter, resourceName = 'user', properties, ignoreTemporals) {
  const convertedFilter = {
    [filter.operator]: [],
  };
  filter.subfilters.forEach((filterRule) => {
    if (filterRule.operator === 'or' || filterRule.operator === 'and') {
      convertedFilter[filter.operator].push(convertToIGAFilter(filterRule, resourceName, properties, ignoreTemporals));
    } else if (filterRule.operator === 'is_null' || filterRule.operator === 'is_not_null') {
      // Unary operators carry no value operand — the temporal field path is the whole operand
      const field = ignoreTemporals ? filterRule.field : `${resourceName}.${filterRule.temporalValue}.${filterRule.field}`;
      convertedFilter[filter.operator].push({ [filterRule.operator]: field });
    } else {
      const operator = operatorMap[filterRule.operator] || filterRule.operator;
      const subfilter = { [operator]: {} };
      if (filterRule.operator.endsWith('_changed')) {
        // Special consideration for has changed and has not changed
        subfilter[operator].left = `${resourceName}.before.${filterRule.field}`;
        subfilter[operator].right = `${resourceName}.after.${filterRule.field}`;
      } else {
        subfilter[operator][filterValueMap[operator]] = typeof filterRule.value === 'string' && filterRule.value.startsWith(`${resourceName}.`)
          ? filterRule.value
          : { literal: filterRule.value };
        const selectedProperty = properties.find((property) => property.value === filterRule.field);

        // convert boolean values from string to boolean
        if (selectedProperty?.type === 'boolean') {
          subfilter[operator][filterValueMap[operator]] = { literal: filterRule.value === 'True' };
        }

        if (selectedProperty?.type === 'array' && (selectedProperty?.path || selectedProperty?.itemType === 'string')) {
          // We need to set arrays of relationships back to in_string_array instead of in_string
          subfilter[operator].in_string_array = ignoreTemporals
            ? filterRule.field
            : `${resourceName}.${filterRule.temporalValue}.${filterRule.field}`;
        } else {
          subfilter[operator][filterFieldMap[operator]] = ignoreTemporals
            ? filterRule.field
            : `${resourceName}.${filterRule.temporalValue}.${filterRule.field}`;
        }
      }
      convertedFilter[filter.operator].push(subfilter);
    }
  });
  return convertedFilter;
}

/**
 * Takes IGA formatted filter and converts to format that can be consumed by shared filter builder
 * @param {Object} filter - IGA filter to convert
 * @param {Number} currentUniqueIndex - index to continue counting unique subfilter indexes from
 * @param {Boolean} ignoreTemporals - whether the temporal (before/after) segment of field paths
 *   should be ignored, leaving the full field path intact
 * @param {String} resourceName - name of the resource the filter is aimed against; field paths are
 *   expected to be shaped `${resourceName}.${temporalValue}.${field}` and the empty-filter fallback
 *   defaults to `${resourceName}.after.`
 * @returns {Object} filterBuilder-formatted filter
 */
export function convertFromIGAFilter(filter, currentUniqueIndex = 0, ignoreTemporals, resourceName = 'user') {
  let uniqueIndex = currentUniqueIndex;
  const igaFilter = Object.keys(filter).length ? filter : { or: [{ starts_with: { prefix: { literal: '' }, value: `${resourceName}.after.` } }] };
  const filterEntry = Object.entries(igaFilter)[0];
  const convertedFilter = {
    operator: filterEntry[0],
    subfilters: [],
    uniqueIndex,
  };
  filterEntry[1].forEach((filterRule) => {
    const [operator, fieldValueObject] = Object.entries(filterRule)[0];
    if (operator === 'or' || operator === 'and') {
      const subfilter = convertFromIGAFilter(filterRule, uniqueIndex + 1, ignoreTemporals, resourceName);
      convertedFilter.subfilters.push(subfilter.convertedFilter);
      uniqueIndex = subfilter.uniqueIndex;
    } else {
      uniqueIndex += 1;
      const subfilter = {
        operator,
        uniqueIndex,
      };
      // equals and not_equals are used fot the has_changed and has_not_changed operators
      // these operators will have left and right string values as opposed to a regular
      // equals or not_equals which will have an object as the right value
      if ((operator === 'not_equals' || operator === 'equals')
        && (typeof fieldValueObject.left === 'string' || fieldValueObject.left instanceof String)
        && (typeof fieldValueObject.right === 'string' || fieldValueObject.right instanceof String)) {
        // field path is `${resourceName}.${temporalValue}.${field}` — keep the
        // full remainder so dotted field names survive
        const field = fieldValueObject.left?.split('.').slice(2).join('.');
        subfilter.operator = operator === 'not_equals'
          ? 'has_changed'
          : 'has_not_changed';
        subfilter.field = field;
        subfilter.temporalValue = 'after';
      } else if (operator === 'is_null' || operator === 'is_not_null') {
        // Unary operators carry the field path as the whole operand (a bare string) with no value
        subfilter.value = '';
        subfilter.field = typeof fieldValueObject === 'string' ? fieldValueObject : '';
        if (subfilter.field && !ignoreTemporals) {
          const splitField = subfilter.field.split('.');
          // an operand without a temporal segment cannot be parsed into
          // `${resourceName}.${temporalValue}.${field}` — keep the raw path as the
          // field (slice(2) would otherwise wipe it) and default the temporal
          const hasTemporal = Boolean(splitField[1]) && splitField.length > 2;
          if (hasTemporal) {
            [, subfilter.temporalValue] = splitField;
            subfilter.field = splitField.slice(2).join('.');
          } else {
            subfilter.temporalValue = 'after';
          }
        } else if (subfilter.field) {
          subfilter.temporalValue = 'after';
        }
      } else {
        // find the key that field converts to
        subfilter.field = fieldValueObject[filterFieldMap[operator]] || fieldValueObject.in_string_array || '';
        // find the key that value converts to
        subfilter.value = fieldValueObject[filterValueMap[operator]] || fieldValueObject.search_string_array || '';
        if (typeof subfilter.value === 'object') {
          // if there is a literal value, we want to remove that layer
          subfilter.value = subfilter.value.literal;
        }
        if (typeof subfilter.value === 'boolean') {
          // if type is boolean, need to convert to string
          subfilter.value = subfilter.value
            ? 'True'
            : 'False';
        }
        if (subfilter.field) {
          // pull temporal value from field [resourceName, temporalValue, ...fieldName] — keep the
          // full remainder joined so dotted field names survive (e.g. account.before.descriptor.displayName)
          const splitField = subfilter.field.split('.');
          if (ignoreTemporals) subfilter.temporalValue = 'after';
          else {
            [, subfilter.temporalValue] = splitField;
            subfilter.field = splitField.slice(2).join('.');
          }
        }
      }
      convertedFilter.subfilters.push(subfilter);
    }
  });
  return { convertedFilter, uniqueIndex };
}

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
 * @property {Number} maxDepth - Maximum depth allowed in filter string
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

/**
 * Checks if IGA filter has depth greater than basic editor allows
 * @param {Object} filter Current IGA filter
 * @param {Number} currentDepth recursive integer uses to determine depth
 * @param {Number} maxDepth Maximum allowed depth
 * @returns Boolean of whether filter is with specified depth
 */
export function checkIGAFilterWithinNLayers(filter, currentDepth, maxDepth) {
  if (currentDepth > maxDepth) {
    return false;
  }
  const layer = Object.entries(filter)[0][1];
  return layer.every((rule) => {
    if (rule.or || rule.and) {
      return checkIGAFilterWithinNLayers(rule, currentDepth + 1, maxDepth);
    }
    return true;
  });
}

/**
 * Checks if stringified IGA filter contains key signifying it contains array value
 * @param {String} filter stringified filter to check if it includes array key
 * @returns Boolean of whether filter contains array key
 */
export function checkIGAFilterForArrays(filter) {
  return filter.includes('search_string_array');
}

/**
 * Checks if IGA filter contains matching before/after conditions for each property in same level
 * @param {String} filter IGA filter to validate
 * @returns Boolean of whether filter is valid
 */
export function checkIGAFilterMeetsRequirements(filter) {
  const layer = Object.values(filter)[0];
  const properties = {};
  layer.forEach((subfilter) => {
    // don't need to check for second condition if subfilter is an or or an and, or if equals or not_equals and both sides of comparison are fields
    if (!(
      subfilter.or
      || subfilter.and
      || (
        subfilter.equals && (
          (
            typeof subfilter.equals.left === 'string'
            && (subfilter.equals.left.includes('before') || subfilter.equals.left.includes('after'))
          )
          && (
            typeof subfilter.equals.right === 'string'
            && (subfilter.equals.right.includes('before') || subfilter.equals.right.includes('after'))
          )
        )
      )
      || (
        subfilter.not_equals && (
          (
            typeof subfilter.not_equals.left === 'string'
            && (subfilter.not_equals.left.includes('before') || subfilter.not_equals.left.includes('after'))
          )
          && (
            typeof subfilter.not_equals.right === 'string'
            && (subfilter.not_equals.right.includes('before') || subfilter.not_equals.right.includes('after'))
          )
        )
      )
    )) {
      // setup to determine if there is at least one after condition to match each unique before property
      const subfilterValues = Object.values(subfilter)[0];
      // unary operators (is_null, is_not_null) carry the field path as the whole operand
      const value = typeof subfilterValues === 'string' ? subfilterValues
        : (subfilterValues.value || subfilterValues.left || subfilterValues.in_string || subfilterValues.in_string_array);
      // group by the full field name (everything after `${resourceName}.${temporalValue}.`) so
      // dotted field names match their before/after pair correctly
      const propertyName = value.split('.').slice(2).join('.');
      if (!properties[propertyName]) {
        properties[propertyName] = {};
      }
      // temporal side is path segment 2 — never a substring test, as field names
      // may legitimately contain 'before'/'after'
      const temporalSide = value.split('.')[1];
      if (temporalSide === 'before') {
        properties[propertyName].beforeFound = true;
      } else if (temporalSide === 'after') {
        properties[propertyName].afterFound = true;
      }
    }
  });
  const allSubfiltersValid = layer.every((subfilter) => {
    if (subfilter.or || subfilter.and) {
      return checkIGAFilterMeetsRequirements(subfilter);
    }
    return true;
  });
  const currentLayerValid = Object.values(properties).every((property) => property.beforeFound && property.afterFound);
  return allSubfiltersValid && currentLayerValid;
}

/**
 * Checks if a key is a glossary attribute
 * A glossary attribute is a key that starts with catalog.{resource}.glossary.,
 * where {resource} is either application, entitlement or role.
 * @param {String} key The key to check
 * @returns {Boolean} Whether the key is a glossary attribute
 */
export function isGlossaryAttribute(key) {
  const pattern = /^catalog\.(application|entitlement|role)\.glossary\./;
  return pattern.test(key);
}
