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
        targetValue: filter?.value || '',
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
