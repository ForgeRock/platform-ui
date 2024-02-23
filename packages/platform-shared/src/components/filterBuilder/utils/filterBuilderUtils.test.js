/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import {
  checkIfWithinThreeLayers,
  checkIGAFilterForArrays,
  checkIGAFilterWithinNLayers,
  convertFromIGAFilter,
  convertToIGAFilter,
  findGroup,
} from './filterBuilderUtils';

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

describe('iga tests', () => {
  const igaFilter = {
    or: [
      {
        starts_with: {
          prefix: {
            literal: 'snValue',
          },
          value: 'user.before.sn',
        },
      },
      {
        not_equals: {
          left: 'user.before.sn',
          right: 'user.after.sn',
        },
      },
      {
        and: [
          {
            equals: {
              in_string_array: 'user.before.members',
              right: {
                literal: 'snValue',
              },
            },
          },
        ],
      },
    ],
  };
  const componentFilter = {
    operator: 'or',
    subfilters: [
      {
        operator: 'starts_with',
        field: 'sn',
        value: 'snValue',
        temporalValue: 'before',
        uniqueIndex: 1,
      },
      {
        operator: 'not_equals',
        field: 'sn',
        temporalValue: 'before',
        uniqueIndex: 2,
        value: 'user.after.sn',
      },
      {
        operator: 'and',
        subfilters: [
          {
            operator: 'equals',
            field: 'members',
            value: 'snValue',
            temporalValue: 'before',
            uniqueIndex: 4,
          },
        ],
        uniqueIndex: 3,
      },
    ],
    uniqueIndex: 0,
  };

  it('converts component filter To IGA Filter', () => {
    const resourceName = 'user';
    const properties = [
      {
        value: 'sn',
        type: 'string',
      },
      {
        value: 'members',
        type: 'array',
        path: 'user',
      },
    ];
    expect(convertToIGAFilter(componentFilter, resourceName, properties)).toStrictEqual(igaFilter);
    const hasChangedFilter = cloneDeep(componentFilter);
    hasChangedFilter.subfilters[1].operator = 'has_changed';
    expect(convertToIGAFilter(hasChangedFilter, resourceName, properties)).toStrictEqual(igaFilter);
  });

  it('converts IGA Filter To component filter', () => {
    const currentUniqueIndex = 0;
    expect(convertFromIGAFilter(igaFilter, currentUniqueIndex)).toStrictEqual({ convertedFilter: componentFilter, uniqueIndex: 4 });
  });

  it('checks IGA filter within n layers', () => {
    expect(checkIGAFilterWithinNLayers(igaFilter)).toBe(true);
  });

  it('checks IGA string filter for array key', () => {
    const stringIgaFilterWithoutArray = '{or:[{starts_with: {prefix: {literal: "snValue"}, value: "user.before.sn"}}]}';
    expect(checkIGAFilterForArrays(stringIgaFilterWithoutArray)).toBe(false);
    const stringIgaFilterWithArray = '{or:[{contains: {search_string_array: [{literal: "value1"}, {literal: "value2"}], in_string_array: "user.after.roles"}}]}';
    expect(checkIGAFilterForArrays(stringIgaFilterWithArray)).toBe(true);
  });
});
