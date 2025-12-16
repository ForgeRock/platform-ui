/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getGovernanceFilter,
  getBasicFilter,
  getBasicBooleanFilter,
  getPriorityFilter,
  getActivePhaseFilter,
  convertTargetFilterToQueryFilter,
} from './filters';

it('gets governance filter', () => {
  const mockFilterObject = {
    operator: 'OR',
    uniqueIndex: 1,
    subfilters: [
      {
        operator: 'EQUALS',
        uniqueIndex: 2,
        field: 'description',
        value: 'firstValue',
      },
      {
        operator: 'EQUALS',
        uniqueIndex: 3,
        field: 'glossary.displayName',
        value: 'secondValue',
      },
    ],
  };
  const expectedGovernanceFilterOutput = {
    operand: [
      {
        operand: {
          targetName: 'description',
          targetValue: 'firstValue',
        },
        operator: 'EQUALS',
      }, {
        operand: {
          targetName: 'glossary.displayName',
          targetValue: 'secondValue',
        },
        operator: 'EQUALS',
      },
    ],
    operator: 'OR',
  };

  expect(getGovernanceFilter(mockFilterObject)).toStrictEqual(expectedGovernanceFilterOutput);

  // Remove the second filter property and test again
  mockFilterObject.subfilters.pop();
  expectedGovernanceFilterOutput.operand.pop();
  expect(getGovernanceFilter(mockFilterObject)).toStrictEqual(expectedGovernanceFilterOutput);
});

describe('getPriorityFilter', () => {
  it('returns the correct filter object based on provided priorities', () => {
    const priorities = {
      high: true, medium: false, low: true, none: false,
    };
    const expectedFilter = {
      operator: 'OR',
      operand: [
        getBasicFilter('EQUALS', 'request.common.priority', 'high'),
        getBasicFilter('EQUALS', 'request.common.priority', 'low'),
      ],
    };

    expect(getPriorityFilter(priorities)).toStrictEqual(expectedFilter);
  });

  it('returns null if no priorities are selected', () => {
    const priorities = {
      high: false, medium: false, low: false, none: false,
    };
    expect(getPriorityFilter(priorities)).toBeNull();
  });
});

describe('getActivePhaseFilter', () => {
  it('returns the correct filter object given a valid query string', () => {
    const queryString = 'phaseName';
    const expectedFilter = {
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

    expect(getActivePhaseFilter(queryString)).toStrictEqual(expectedFilter);
  });

  it('returns null if the query string is not provided', () => {
    expect(getActivePhaseFilter('')).toBeNull();
    expect(getActivePhaseFilter(null)).toBeNull();
    expect(getActivePhaseFilter(undefined)).toBeNull();
  });
});

describe('convertTargetFilterToQueryFilter', () => {
  it('returns a query string with the correct format', () => {
    const filter = {
      operator: 'AND',
      operand: [
        getBasicFilter('EQUALS', 'field1', 'value1'),
        getBasicFilter('CONTAINS', 'field2', 'value2'),
      ],
    };
    const expectedQueryString = "(field1 eq 'value1') and (field2 co 'value2')";
    expect(convertTargetFilterToQueryFilter(filter)).toBe(expectedQueryString);
  });

  it('returns a correct query string for a complex filter', () => {
    const filter = {
      operator: 'AND',
      operand: [
        {
          operator: 'EQUALS',
          operand: { targetName: 'userName', targetValue: 'jdoe' },
        },
        {
          operator: 'GT',
          operand: { targetName: 'loginCount', targetValue: 5 },
        },
        {
          operator: 'NOT',
          operand: [
            {
              operator: 'CONTAINS',
              operand: { targetName: 'email', targetValue: '@test.com' },
            },
          ],
        },
      ],
    };
    const expectedQueryString = "(userName eq 'jdoe') and (loginCount gt '5') and (!(email co '@test.com'))";
    expect(convertTargetFilterToQueryFilter(filter)).toBe(expectedQueryString);
  });

  it('returns a correct query string for a more complex filter', () => {
    const filter = {
      operator: 'OR',
      operand: [
        {
          operator: 'AND',
          operand: [
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'userName',
                targetValue: 'jdoe',
              },
            },
            {
              operator: 'GT',
              operand: {
                targetName: 'loginCount',
                targetValue: 5,
              },
            },
          ],
        },
        {
          operator: 'AND',
          operand: [
            {
              operator: 'STARTS_WITH',
              operand: {
                targetName: 'email',
                targetValue: 'admin@',
              },
            },
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'status',
                targetValue: 'active',
              },
            },
          ],
        },
      ],
    };
    const expectedQueryString = "((userName eq 'jdoe') and (loginCount gt '5')) or ((email sw 'admin@') and (status eq 'active'))";
    expect(convertTargetFilterToQueryFilter(filter)).toBe(expectedQueryString);
  });

  it('returns a correct query string with an improper empty boolean', () => {
    const filter = {
      operator: 'OR',
      operand: [
        {
          operator: 'AND',
          operand: [],
        },
        {
          operator: 'EQUALS',
          operand: {
            targetName: 'status',
            targetValue: 'active',
          },
        },
      ],
    };
    const expectedQueryString = "(status eq 'active')";
    expect(convertTargetFilterToQueryFilter(filter)).toBe(expectedQueryString);
  });

  it('returns an empty string if no filter is provided', () => {
    expect(convertTargetFilterToQueryFilter()).toBe('true');
  });

  describe('getBasicBooleanFilter', () => {
    it('returns correct filter for AND value', () => {
      const innerFilters = [
        getBasicFilter('EQUALS', 'isActive', true),
        getBasicFilter('EQUALS', 'isPrivileged', false),
      ];
      const expectedFilter = {
        operator: 'AND',
        operand: innerFilters,
      };
      expect(getBasicBooleanFilter('AND', innerFilters)).toStrictEqual(expectedFilter);
    });
  });
});
