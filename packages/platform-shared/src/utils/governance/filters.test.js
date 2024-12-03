/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getGovernanceFilter,
  getBasicFilter,
  getPriorityFilter,
  getActivePhaseFilter,
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
