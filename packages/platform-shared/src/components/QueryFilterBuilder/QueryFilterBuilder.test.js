/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import QueryFilterBuilder from './index';

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

describe('QueryFilterBuilder', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(QueryFilterBuilder, 'created')
      .mockImplementation(() => {});

    wrapper = shallowMount(QueryFilterBuilder, {
      stubs: {
        'router-link': true,
        ToggleButton: true,
      },
      mocks: {
        $t: () => {},
        $store: {
          state: {
            userId: 'foo',
          },
        },
      },
    });
  });

  afterEach(() => {
    wrapper = null;
  });

  it('QueryFilterBuilder successfully loaded', () => {
    expect(wrapper.name()).toEqual('QueryFilterBuilder');
  });

  it('Creates default group', () => {
    expect(wrapper.vm.getDefaultGroup()).toEqual({
      subfilters: [{
        operator: 'co',
        field: '/',
        value: '',
        uniqueIndex: 1,
      }],
      operator: 'or',
      uniqueIndex: 2,
    });
    expect(wrapper.vm.getDefaultGroup([{
      operator: 'eq',
      field: '/sn',
      value: 'name',
      uniqueIndex: 4,
    }])).toEqual({
      subfilters: [{
        operator: 'eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 4,
      }],
      operator: 'or',
      uniqueIndex: 3,
    });
  });

  it('Creates default rule', () => {
    expect(wrapper.vm.getDefaultRule()).toEqual({
      operator: 'co',
      field: '/',
      value: '',
      uniqueIndex: 1,
    });
    expect(wrapper.vm.getDefaultRule('eq', '/sn', 'name')).toEqual({
      operator: 'eq',
      field: '/sn',
      value: 'name',
      uniqueIndex: 2,
    });
  });

  it('Creates unique index', () => {
    wrapper.vm.uniqueIndex = 0;
    expect(wrapper.vm.getUniqueIndex()).toEqual(1);
  });

  it('Checks if filter string is greater than 3 layers deep', () => {
    expect(wrapper.vm.checkIfWithinThreeLayers('/sn eq ""')).toEqual(true);
    expect(wrapper.vm.checkIfWithinThreeLayers('(((((/sn eq "")))))')).toEqual(false);
  });

  it('converts filter object to string', () => {
    let returnObject = wrapper.vm.toFilterString({
      operator: 'or',
      subfilters: [{
        operator: 'eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 2,
      }],
    }, 0);
    expect(returnObject).toEqual('/sn eq "name"');

    returnObject = wrapper.vm.toFilterString({
      operator: 'or',
      subfilters: [{
        operator: '!eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 2,
      }],
    }, 0);
    expect(returnObject).toEqual('!(/sn eq "name")');

    returnObject = wrapper.vm.toFilterString({
      operator: 'or',
      subfilters: [{
        operator: '!eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 2,
      }, {
        operator: '!eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 3,
      }],
    }, 0);
    expect(returnObject).toEqual('(!(/sn eq "name") or !(/sn eq "name"))');

    returnObject = wrapper.vm.toFilterString({
      operator: 'or',
      subfilters: [{
        operator: '!eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 2,
      }, {
        operator: 'and',
        subfilters: [{
          operator: 'eq',
          field: '/sn',
          value: 'name',
          uniqueIndex: 3,
        }, {
          operator: 'eq',
          field: '/sn',
          value: 'name',
          uniqueIndex: 4,
        }],
        uniqueIndex: 5,
      }],
    }, 0);
    expect(returnObject).toEqual('(!(/sn eq "name") or (/sn eq "name" and /sn eq "name"))');
  });

  it('Checks for boolean operators', () => {
    let returnObject = wrapper.vm.hasAdvancedProperty({
      operator: 'or',
      subfilters: [{
        operator: 'eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 2,
      }],
    }, false);
    expect(returnObject).toBeFalsy();

    returnObject = wrapper.vm.hasAdvancedProperty({
      operator: 'or',
      subfilters: [{
        operator: false,
        uniqueIndex: 2,
      }],
    }, false);
    expect(returnObject).toBeTruthy();
  });

  it('normalize query object', () => {
    // this.editProperty.value = '!(/userName co "test")';
    const shouldNotChange = {
      operator: 'or',
      subfilter: {
        operator: 'eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 3,
      },
      uniqueIndex: 2,
    };
    wrapper.vm.normalizeQueryFilterObject(shouldNotChange);
    expect(shouldNotChange).toEqual({
      operator: 'or',
      subfilter: {
        operator: 'eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 3,
      },
      uniqueIndex: 2,
    });

    const shouldChange = {
      operator: 'or',
      subfilters: [{
        operator: '!',
        subfilter: {
          operator: 'eq',
          field: '/sn',
          value: 'name',
          uniqueIndex: 3,
        },
        uniqueIndex: 2,
      }],
    };
    expect(wrapper.vm.normalizeQueryFilterObject(shouldChange)).toEqual({
      operator: 'or',
      subfilters: [{
        operator: '!eq',
        field: '/sn',
        value: 'name',
        uniqueIndex: 3,
      }],
    });
  });
});
