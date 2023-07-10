/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getGovernanceFilter } from './filters';

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
