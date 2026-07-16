/**
 * Copyright (c) 2022-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import {
  checkIfWithinThreeLayers,
  checkIGAFilterForArrays,
  checkIGAFilterMeetsRequirements,
  checkIGAFilterWithinNLayers,
  convertFromIGAFilter,
  convertToIGAFilter,
  findGroup,
  isGlossaryAttribute,
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
        equals: {
          left: 'user.after.cn',
          right: {
            literal: 'test',
          },
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
      {
        equals: {
          left: 'user.after.num',
          right: {
            literal: 10,
          },
        },
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
        operator: 'has_changed',
        field: 'sn',
        temporalValue: 'after',
        uniqueIndex: 2,
      },
      {
        operator: 'equals',
        field: 'cn',
        value: 'test',
        temporalValue: 'after',
        uniqueIndex: 3,
      },
      {
        operator: 'and',
        subfilters: [
          {
            operator: 'equals',
            field: 'members',
            value: 'snValue',
            temporalValue: 'before',
            uniqueIndex: 5,
          },
        ],
        uniqueIndex: 4,
      },
      {
        operator: 'equals',
        field: 'num',
        value: 10,
        temporalValue: 'after',
        uniqueIndex: 6,
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
      {
        value: 'num',
        type: 'number',
      },
    ];
    expect(convertToIGAFilter(componentFilter, resourceName, properties)).toStrictEqual(igaFilter);
    const hasChangedFilter = cloneDeep(componentFilter);
    hasChangedFilter.subfilters[1].operator = 'has_changed';
    expect(convertToIGAFilter(hasChangedFilter, resourceName, properties)).toStrictEqual(igaFilter);
  });

  it('converts IGA Filter To component filter', () => {
    const currentUniqueIndex = 0;
    expect(convertFromIGAFilter(igaFilter, currentUniqueIndex)).toStrictEqual({ convertedFilter: componentFilter, uniqueIndex: 6 });
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

  describe('ignoreTemporals', () => {
    const igaFilterNoTemporal = {
      or: [
        {
          starts_with: {
            prefix: {
              literal: 'snValue',
            },
            value: 'user.sn',
          },
        },
        {
          equals: {
            left: 'user.cn',
            right: {
              literal: 'test',
            },
          },
        },
        {
          contains: {
            in_string_array: 'user.stringArray',
            search_string: {
              literal: 'test',
            },
          },
        },
        {
          and: [
            {
              equals: {
                in_string_array: 'user.members',
                right: {
                  literal: 'snValue',
                },
              },
            },
          ],
        },
      ],
    };

    const componentFilterNoTemporal = {
      operator: 'or',
      subfilters: [
        {
          operator: 'starts_with',
          field: 'user.sn',
          value: 'snValue',
          temporalValue: 'after',
          uniqueIndex: 1,
        },
        {
          operator: 'equals',
          field: 'user.cn',
          value: 'test',
          temporalValue: 'after',
          uniqueIndex: 2,
        },
        {
          operator: 'contains',
          field: 'user.stringArray',
          value: 'test',
          temporalValue: 'after',
          uniqueIndex: 3,
        },
        {
          operator: 'and',
          subfilters: [
            {
              operator: 'equals',
              field: 'user.members',
              value: 'snValue',
              temporalValue: 'after',
              uniqueIndex: 5,
            },
          ],
          uniqueIndex: 4,
        },
      ],
      uniqueIndex: 0,
    };

    it('ignores temporals when converting to iga filter', () => {
      const resourceName = 'user';
      const properties = [
        {
          value: 'user.sn',
          type: 'string',
        },
        {
          value: 'user.members',
          type: 'array',
          path: 'user',
        },
        {
          value: 'user.stringArray',
          type: 'array',
          itemType: 'string',
        },
      ];
      expect(convertToIGAFilter(componentFilterNoTemporal, resourceName, properties, true)).toStrictEqual(igaFilterNoTemporal);
    });

    it('ignores temporals when converting from iga filter', () => {
      const currentUniqueIndex = 0;
      expect(convertFromIGAFilter(igaFilterNoTemporal, currentUniqueIndex, true)).toStrictEqual({ convertedFilter: componentFilterNoTemporal, uniqueIndex: 5 });
    });
  });

  it('validation if a schema property key is a glossary attribute, should be true', () => {
    const schemaPropertyKey = 'catalog.application.glossary.owner';
    expect(isGlossaryAttribute(schemaPropertyKey)).toBe(true);
  });

  it('validation if a schema property key is a glossary attribute, should be false', () => {
    const schemaPropertyKey = 'catalog.application.name';
    expect(isGlossaryAttribute(schemaPropertyKey)).toBe(false);
  });

  describe('unary is_null / is_not_null operators', () => {
    const unaryIgaFilter = {
      or: [
        { is_not_null: 'account.after.displayName' },
        { is_null: 'account.before.mail' },
        {
          and: [
            { is_null: 'account.after.manager' },
          ],
        },
      ],
    };
    const unaryComponentFilter = {
      operator: 'or',
      subfilters: [
        {
          operator: 'is_not_null',
          field: 'displayName',
          value: '',
          temporalValue: 'after',
          uniqueIndex: 1,
        },
        {
          operator: 'is_null',
          field: 'mail',
          value: '',
          temporalValue: 'before',
          uniqueIndex: 2,
        },
        {
          operator: 'and',
          subfilters: [
            {
              operator: 'is_null',
              field: 'manager',
              value: '',
              temporalValue: 'after',
              uniqueIndex: 4,
            },
          ],
          uniqueIndex: 3,
        },
      ],
      uniqueIndex: 0,
    };
    const unaryComponentFilterNested = {
      operator: 'or',
      subfilters: [
        unaryComponentFilter.subfilters[0],
        unaryComponentFilter.subfilters[1],
        {
          operator: 'and',
          subfilters: [unaryComponentFilter.subfilters[2].subfilters[0]],
          uniqueIndex: 3,
        },
      ],
      uniqueIndex: 0,
    };

    it('converts unary component filters to bare-operand IGA filters with no value', () => {
      expect(convertToIGAFilter(unaryComponentFilterNested, 'account')).toStrictEqual(unaryIgaFilter);
    });

    it('converts unary IGA filters to component filters without value operands', () => {
      expect(convertFromIGAFilter(unaryIgaFilter, 0, false, 'account')).toStrictEqual({
        convertedFilter: unaryComponentFilter,
        uniqueIndex: 4,
      });
    });

    it('round-trips unary rules through both conversions', () => {
      const { convertedFilter } = convertFromIGAFilter(unaryIgaFilter, 0, false, 'account');
      expect(convertToIGAFilter(convertedFilter, 'account')).toStrictEqual(unaryIgaFilter);
    });

    it('keeps the full field path when ignoring temporals', () => {
      const igaFilterNoTemporal = { or: [{ is_not_null: 'account.displayName' }] };
      const componentFilterNoTemporal = {
        operator: 'or',
        subfilters: [
          {
            operator: 'is_not_null',
            field: 'account.displayName',
            value: '',
            temporalValue: 'after',
            uniqueIndex: 1,
          },
        ],
        uniqueIndex: 0,
      };
      // to IGA
      expect(convertToIGAFilter(componentFilterNoTemporal, 'account', [], true)).toStrictEqual(igaFilterNoTemporal);
      // from IGA
      expect(convertFromIGAFilter(igaFilterNoTemporal, 0, true, 'account')).toStrictEqual({
        convertedFilter: componentFilterNoTemporal,
        uniqueIndex: 1,
      });
    });

    it('validates before/after pairing for unary rules without crashing', () => {
      // both sides present — valid
      const valid = {
        or: [
          { is_null: 'account.before.mail' },
          { is_null: 'account.after.mail' },
        ],
      };
      expect(checkIGAFilterMeetsRequirements(valid)).toBe(true);
      // only one side — invalid, not a crash
      const invalid = {
        or: [
          { is_null: 'account.before.mail' },
          { is_null: 'account.after.other' },
        ],
      };
      expect(checkIGAFilterMeetsRequirements(invalid)).toBe(false);
    });

    it('classifies the temporal side by path segment, not substring', () => {
      // a field named "beforePhoto" contains 'before' — the substring check would
      // classify its after rule as a before rule and never validate the pair
      const filter = {
        or: [
          { starts_with: { prefix: { literal: 'x' }, value: 'account.before.beforePhoto' } },
          { starts_with: { prefix: { literal: 'x' }, value: 'account.after.beforePhoto' } },
        ],
      };
      expect(checkIGAFilterMeetsRequirements(filter)).toBe(true);
    });

    it('does not crash on a non-string unary operand', () => {
      const filter = {
        or: [{ is_null: { path: 'x' } }],
      };
      expect(convertFromIGAFilter(filter, 0, false, 'account').convertedFilter.subfilters[0]).toEqual({
        operator: 'is_null',
        field: '',
        value: '',
        uniqueIndex: 1,
      });
    });

    it('defaults the temporal for a unary operand without a temporal segment', () => {
      // operand is a bare field path with no `${resourceName}.${temporal}.` prefix —
      // parsing it as 3-segment would wipe the field and re-emit '<resource>.undefined.'
      const filter = {
        or: [{ is_null: 'displayName' }],
      };
      const { convertedFilter } = convertFromIGAFilter(filter, 0, false, 'account');
      expect(convertedFilter.subfilters[0]).toEqual({
        operator: 'is_null',
        field: 'displayName',
        value: '',
        temporalValue: 'after',
        uniqueIndex: 1,
      });
      // re-emitting normalizes to the full temporal path — never 'account.undefined.'
      expect(convertToIGAFilter(convertedFilter, 'account')).toStrictEqual({
        or: [{ is_null: 'account.after.displayName' }],
      });
    });
  });

  describe('dotted field names (account schema)', () => {
    const dottedField = 'descriptor.displayName';
    const dottedIgaFilter = {
      or: [
        {
          starts_with: {
            prefix: {
              literal: 'John',
            },
            value: `account.before.${dottedField}`,
          },
        },
        {
          not_equals: {
            left: `account.before.${dottedField}`,
            right: `account.after.${dottedField}`,
          },
        },
      ],
    };
    const dottedComponentFilter = {
      operator: 'or',
      subfilters: [
        {
          operator: 'starts_with',
          field: dottedField,
          value: 'John',
          temporalValue: 'before',
          uniqueIndex: 1,
        },
        {
          operator: 'has_changed',
          field: dottedField,
          temporalValue: 'after',
          uniqueIndex: 2,
        },
      ],
      uniqueIndex: 0,
    };

    it('converts a dotted IGA filter into a full dotted component field', () => {
      expect(convertFromIGAFilter(dottedIgaFilter, 0, false, 'account')).toStrictEqual({
        convertedFilter: dottedComponentFilter,
        uniqueIndex: 2,
      });
    });

    it('converts a dotted component filter back to the full backend field paths', () => {
      expect(convertToIGAFilter(dottedComponentFilter, 'account', [
        { value: dottedField, type: 'string' },
      ])).toStrictEqual(dottedIgaFilter);
    });

    it('round-trips a dotted account filter through both conversions', () => {
      const { convertedFilter } = convertFromIGAFilter(dottedIgaFilter, 0, false, 'account');
      expect(convertToIGAFilter(convertedFilter, 'account', [
        { value: dottedField, type: 'string' },
      ])).toStrictEqual(dottedIgaFilter);
    });

    it('preserves deeper dotted segments than three in the has_changed branch', () => {
      const filter = {
        and: [
          {
            not_equals: {
              left: 'account.before.descriptor.application.name',
              right: 'account.after.descriptor.application.name',
            },
          },
        ],
      };
      const { convertedFilter } = convertFromIGAFilter(filter, 0, false, 'account');
      expect(convertedFilter.subfilters[0]).toEqual({
        operator: 'has_changed',
        field: 'descriptor.application.name',
        temporalValue: 'after',
        uniqueIndex: 1,
      });
    });

    it('keeps the empty-filter fallback on the caller resourceName', () => {
      // with ignoreTemporals the field keeps the full raw path, exposing the
      // `${resourceName}.after.` fallback value the function synthesizes
      const accountFallback = convertFromIGAFilter({}, 0, true, 'account');
      expect(accountFallback.convertedFilter.subfilters[0].field).toBe('account.after.');

      const userFallback = convertFromIGAFilter({}, 0, true, 'user');
      expect(userFallback.convertedFilter.subfilters[0].field).toBe('user.after.');

      // without ignoreTemporals the empty fallback strips to the default shape
      const accountNoTemporals = convertFromIGAFilter({}, 0, false, 'account');
      expect(accountNoTemporals.convertedFilter.subfilters).toEqual([{
        operator: 'starts_with',
        field: '',
        value: '',
        temporalValue: 'after',
        uniqueIndex: 1,
      }]);
    });

    it('defaults to the user resource when resourceName is not passed (Scopes compatibility)', () => {
      const { convertedFilter } = convertFromIGAFilter({});
      expect(convertedFilter.subfilters).toEqual([{
        operator: 'starts_with',
        field: '',
        value: '',
        temporalValue: 'after',
        uniqueIndex: 1,
      }]);
      // default 3-segment behavior is unchanged
      const legacy = convertFromIGAFilter({
        or: [{ starts_with: { prefix: { literal: 'x' }, value: 'user.before.sn' } }],
      });
      expect(legacy.convertedFilter.subfilters[0].field).toBe('sn');
    });
  });

  describe('checkIGAFilterMeetsRequirements dotted grouping', () => {
    it('accepts matching before/after pairs for a dotted field', () => {
      const filter = {
        or: [
          { starts_with: { prefix: { literal: 'x' }, value: 'account.before.descriptor.displayName' } },
          { starts_with: { prefix: { literal: 'x' }, value: 'account.after.descriptor.displayName' } },
        ],
      };
      expect(checkIGAFilterMeetsRequirements(filter)).toBe(true);
    });

    it('rejects a dotted field that only has a before condition', () => {
      const filter = {
        or: [
          { starts_with: { prefix: { literal: 'x' }, value: 'account.before.descriptor.displayName' } },
          { starts_with: { prefix: { literal: 'x' }, value: 'account.after.other.prop' } },
        ],
      };
      expect(checkIGAFilterMeetsRequirements(filter)).toBe(false);
    });

    it('still validates 3-segment user fields identically', () => {
      const valid = {
        or: [
          { starts_with: { prefix: { literal: 'x' }, value: 'user.before.sn' } },
          { starts_with: { prefix: { literal: 'x' }, value: 'user.after.sn' } },
        ],
      };
      expect(checkIGAFilterMeetsRequirements(valid)).toBe(true);

      const invalid = {
        or: [
          { starts_with: { prefix: { literal: 'x' }, value: 'user.before.sn' } },
          { starts_with: { prefix: { literal: 'x' }, value: 'user.after.cn' } },
        ],
      };
      expect(checkIGAFilterMeetsRequirements(invalid)).toBe(false);
    });
  });
});
