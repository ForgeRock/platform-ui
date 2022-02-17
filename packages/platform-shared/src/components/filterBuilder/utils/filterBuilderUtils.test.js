/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { checkIfWithinThreeLayers, findGroup } from './filterBuilderUtils';

describe('checkIfWithinThreeLayers', () => {
  it('Checks if filter string is greater than 3 layers deep', () => {
    expect(checkIfWithinThreeLayers('/sn eq ""', 4)).toEqual(true);
    expect(checkIfWithinThreeLayers('(((((/sn eq "")))))', 4)).toEqual(false);
  });
});

describe('Find Group', () => {
  const subFilterUserName = {
    operator: 'co', field: '/userName', value: 'test', uniqueIndex: 2,
  };

  const subFilters3Not = {
    operator: '!eq', field: '/sn', value: 'name', uniqueIndex: 3,
  };

  const subFilterAccount = {
    operator: 'eq', field: '/accountStatus', value: 'active', uniqueIndex: 1,
  };

  it('Returns filter if only 1 group', () => {
    const filter = { subfilters: [subFilters3Not], operator: 'or' };
    const groups = findGroup(filter, ['0'], 0, 0);
    expect(groups).toEqual(filter);
  });

  it('Returns correct group if there are multiple', () => {
    const filter = {
      subfilters: [
        subFilters3Not,
        subFilterAccount,
        { subfilters: [subFilterUserName], operator: 'or', uniqueIndex: 3 },
      ],
      operator: 'or',
    };
    const resp = { operator: 'or', subfilters: [subFilterUserName], uniqueIndex: 3 };

    const groups = findGroup(filter, ['0', '2'], 1, 1);
    expect(groups).toEqual(resp);
  });
});
