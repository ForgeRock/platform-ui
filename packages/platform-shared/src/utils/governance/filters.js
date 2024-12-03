/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Converts queryFilterBuilder formatted query into governance query filter
 * @param {Object} filterObject query filter in IDM format
 * @returns {Object} query filter in IGA format
 */
export function getGovernanceFilter(filterObject) {
  const generateFilter = (filter) => {
    const newFilter = {};
    newFilter.operator = filter?.operator?.toUpperCase();
    if (newFilter.operator === 'NOT') {
      newFilter.operand = [];
      filter.subfilters.forEach((sub) => {
        newFilter.operand.push(generateFilter(sub));
      });
    } else if (newFilter.operator.startsWith('NOT')) {
      newFilter.operator = 'NOT';
      newFilter.operand = [generateFilter({ ...filter, operator: filter.operator.split('NOT ').pop() })];
    } else if (!filter?.subfilters) {
      newFilter.operand = {
        targetName: filter?.field || '',
        targetValue: filter?.value ?? '',
      };
    } else {
      newFilter.operand = [];
      filter.subfilters.forEach((sub) => {
        newFilter.operand.push(generateFilter(sub));
      });
    }
    return newFilter;
  };
  return filterObject ? generateFilter(filterObject) : '';
}

export function getBasicFilter(operator, targetName, targetValue) {
  return {
    operator,
    operand: {
      targetName,
      targetValue,
    },
  };
}

/**
 * Returns a basic "NOT" filter object.
 *
 * @param {string} operator - The operator for the filter.
 * @param {string} targetName - The target name for the filter.
 * @param {any} targetValue - The target value for the filter.
 * @returns {object} - The "NOT" filter object.
 */
export function getBasicNotFilter(operator, targetName, targetValue) {
  return {
    operator: 'NOT',
    operand: [
      {
        operator,
        operand: {
          targetName,
          targetValue,
        },
      },
    ],
  };
}

/**
 * Generates a filter object based on the provided priorities.
 *
 * @param {Object} priorities - An object where keys are priority levels and values are booleans indicating if the priority is selected.
 * @returns {Object|null} A filter object with an 'OR' operator and an array of priority filters, or null if no priorities are selected.
 */
export function getPriorityFilter(priorities) {
  const prioritiesArray = [];
  Object.keys(priorities).forEach((priority) => {
    if (priorities[priority]) prioritiesArray.push(priority);
  });

  const priorityFilters = prioritiesArray.map((priority) => {
    if (priority === 'none') return getBasicNotFilter('EXISTS', 'request.common.priority');
    return getBasicFilter('EQUALS', 'request.common.priority', priority);
  });

  return priorityFilters.length
    ? { operator: 'OR', operand: priorityFilters }
    : null;
}

/**
 * Generates a filter object to look for active phases that match the query string.
 *
 * @param {String} queryString - The query string to filter phases by display name or name.
 * @returns {Object|null} The filter object if queryString is provided, otherwise null.
 */
export function getActivePhaseFilter(queryString) {
  if (!queryString) return null;

  return {
    operator: 'AND',
    operand: [
      {
        operator: 'OR',
        operand: [
          getBasicFilter('CONTAINS', 'decision.phases.displayName', queryString),
          getBasicFilter('CONTAINS', 'decision.phases.name', queryString),
        ],
      },
      getBasicFilter('EQUALS', 'decision.phases.status', 'in-progress'),
    ],
  };
}
