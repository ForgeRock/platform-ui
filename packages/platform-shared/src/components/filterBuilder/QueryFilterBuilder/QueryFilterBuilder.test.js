/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import QueryFilterBuilder from './index';
import * as QFD from '../utils/QueryFilterDefaults';

// Various test values
// this.editProperty.value = true;
// this.editProperty.value = '/userName co "test"';
// this.editProperty.value = '(/city eq "" or /city eq "")';
// this.editProperty.value = '(/city eq "" or /city eq "") or (/city eq "" or /city eq "")';
// this.editProperty.value = '!(/userName co "test")';
// this.editProperty.value = '!((/city eq "" or /city eq ""))';
// this.editProperty.value = '!(/city eq "" and !(/city eq ""))';
// this.editProperty.value = '!((/city eq "") and (/city eq "" and /city eq ""))';
// this.editProperty.value = '!((/city eq "" or !((/city eq "" and /city eq ""))))';
// this.editProperty.value = '!((!((/city eq "" and /city eq "")) or !((/city eq "" and /city eq ""))))';
// this.editProperty.value = '(/userName co "test" or (/ co "" or (/sn co "" or /sn co "" or (/sn co "" or /sn co "" or /sn co ""))))';
// this.editProperty.value = '(/userName co "test" or (/ co "" or (/sn co "" or /sn co "")))';

const subFilters1 = {
  operator: 'co', field: '/', value: '', uniqueIndex: 1,
};
const subFilters2 = {
  operator: 'eq', field: '/sn', value: 'name', uniqueIndex: 2,
};
const subFilters2Not = {
  operator: '!eq', field: '/sn', value: 'name', uniqueIndex: 2,
};
const subFilters3 = {
  operator: 'eq', field: '/sn', value: 'name', uniqueIndex: 3,
};
const subFilters3Not = {
  operator: '!eq', field: '/sn', value: 'name', uniqueIndex: 3,
};
const subFilters4 = {
  operator: 'eq', field: '/sn', value: 'name', uniqueIndex: 4,
};
const subFilterAccount = {
  operator: 'eq', field: '/accountStatus', value: 'active', uniqueIndex: 1,
};

describe('QueryFilterBuilder', () => {
  let wrapper;
  QueryFilterBuilder.created = jest.fn();

  beforeEach(() => {
    wrapper = shallowMount(QueryFilterBuilder, {
      global: {
        stubs: { 'router-link': true },
        mocks: {
          $t: () => {},
          $store: { state: { userId: 'foo' } },
        },
      },
      props: { resourceName: 'user' },
    });
  });

  it('Creates default group', () => {
    expect(wrapper.vm.getDefaultGroup()).toEqual({ subfilters: [subFilters1], operator: 'or', uniqueIndex: 2 });

    expect(wrapper.vm.getDefaultGroup([subFilters4])).toEqual({
      subfilters: [subFilters4], operator: 'or', uniqueIndex: 3,
    });
  });

  it('Creates default rule', () => {
    expect(wrapper.vm.getDefaultRule()).toEqual(subFilters1);
    expect(wrapper.vm.getDefaultRule('eq', '/sn', 'name')).toEqual(subFilters2);
  });

  it('Creates unique index', () => {
    wrapper.vm.uniqueIndex = 0;
    expect(wrapper.vm.getUniqueIndex()).toEqual(1);
  });

  it('converts filter object to string', () => {
    let returnObject = wrapper.vm.toFilterString({ operator: 'or', subfilters: [subFilters2] }, 0);
    expect(returnObject).toEqual('/sn eq "name"');

    returnObject = wrapper.vm.toFilterString({ operator: 'or', subfilters: [subFilters2Not] }, 0);
    expect(returnObject).toEqual('!(/sn eq "name")');

    returnObject = wrapper.vm.toFilterString({ operator: 'or', subfilters: [subFilters2Not, subFilters3Not] }, 0);
    expect(returnObject).toEqual('(!(/sn eq "name") or !(/sn eq "name"))');

    returnObject = wrapper.vm.toFilterString({
      operator: 'or',
      subfilters: [subFilters2Not, { operator: 'and', subfilters: [subFilters3, subFilters4], uniqueIndex: 5 }],
    }, 0);
    expect(returnObject).toEqual('(!(/sn eq "name") or (/sn eq "name" and /sn eq "name"))');
  });

  it('Checks for boolean operators', () => {
    let returnObject = wrapper.vm.hasAdvancedProperty({ operator: 'or', subfilters: [subFilters2] }, false);
    expect(returnObject).toBeFalsy();

    returnObject = wrapper.vm.hasAdvancedProperty({ operator: 'or', subfilters: [{ operator: false, uniqueIndex: 2 }] }, false);
    expect(returnObject).toBeTruthy();
  });

  it('normalize query object', () => {
    const shouldNotChange = { operator: 'or', subfilter: subFilters3, uniqueIndex: 2 };
    expect(wrapper.vm.normalizeQueryFilterObject(shouldNotChange)).toEqual(shouldNotChange);

    const shouldChange = { operator: 'or', subfilters: [{ operator: '!', subfilter: subFilters3, uniqueIndex: 2 }] };
    expect(wrapper.vm.normalizeQueryFilterObject(shouldChange)).toEqual({ operator: 'or', subfilters: [subFilters3Not] });
  });

  describe('UpdateFilter', () => {
    it('Updates filter with new rule', () => {
      const addRule = {
        depth: 0, index: 0, path: '0', value: { field: '/userName' },
      };
      const qfBefore = { subfilters: [subFilters3], operator: 'or', uniqueIndex: 4 };
      const resp = {
        subfilters: [subFilters3, { operator: 'or', subfilters: [subFilters1], uniqueIndex: 2 }],
        operator: 'or',
        uniqueIndex: 4,
      };

      wrapper.setData({ queryFilter: qfBefore });
      wrapper.vm.updateFilter('add-rule', addRule);
      expect(wrapper.vm.queryFilter).toEqual(resp);
    });

    it('Updates filter with rule change', () => {
      const ruleChange = {
        depth: 0, index: 0, path: '0', value: { operator: '!eq' },
      };
      const qfBefore = { subfilters: [subFilters2], operator: 'or', uniqueIndex: 1 };
      const resp = { subfilters: [subFilters2Not], operator: 'or', uniqueIndex: 1 };

      wrapper.setData({ queryFilter: qfBefore });
      wrapper.vm.updateFilter('rule-change', ruleChange);
      expect(wrapper.vm.queryFilter).toEqual(resp);
    });

    it('Updates filter by removing rule', () => {
      const removeRule = { depth: 0, index: 1, path: '0' };
      const qfBefore = {
        subfilters: [
          subFilters3Not,
          subFilterAccount,
        ],
        operator: 'or',
      };
      const resp = { operator: 'or', subfilters: [subFilters3Not] };

      wrapper.setData({ queryFilter: qfBefore });
      wrapper.vm.updateFilter('remove-rule', removeRule);
      expect(wrapper.vm.queryFilter).toEqual(resp);
    });
  });

  describe('To Filter String', () => {
    it('If only one subfilter and its !', () => {
      const filter = { subfilter: subFilters3Not };
      const newString = wrapper.vm.toFilterString(filter, 0);
      expect(newString).toEqual('!!(/sn eq "name")');
    });

    it('If only one subfilter and its not !', () => {
      const filter = { subfilter: subFilters3 };
      const newString = wrapper.vm.toFilterString(filter, 0);
      expect(newString).toEqual('/sn eq "name"');
    });

    it('Returns correct group if there are multiple', () => {
      const filter = { subfilter: subFilters3 };
      const newString = wrapper.vm.toFilterString(filter, 1);
      expect(newString).toEqual('(/sn eq "name")');
    });
  });

  describe('To Type', () => {
    it('Returns a string', () => {
      QFD.getTypeFromValue = jest.fn().mockReturnValueOnce('string');
      const newVal = wrapper.vm.toType('string', 'field');
      expect(newVal).toBe('"string"');
    });

    it('Returns a number', () => {
      QFD.getTypeFromValue = jest.fn().mockReturnValueOnce('number');
      const newVal = wrapper.vm.toType('1', 'field');
      expect(newVal).toBe('1');
    });

    it('Returns a boolean', () => {
      QFD.getTypeFromValue = jest.fn().mockReturnValueOnce('boolean');
      const newVal = wrapper.vm.toType('true', 'field');
      expect(newVal).toBeTruthy();
    });

    it('Returns the default', () => {
      QFD.getTypeFromValue = jest.fn().mockReturnValueOnce('object');
      const newVal = wrapper.vm.toType('string', 'field');
      expect(newVal).toBe('"string"');
    });

    it('Returns a default if no type found', () => {
      QFD.getTypeFromValue = jest.fn().mockReturnValueOnce(null);
      const newVal = wrapper.vm.toType('string', 'field');
      expect(newVal).toBe('"string"');
    });
  });
});
