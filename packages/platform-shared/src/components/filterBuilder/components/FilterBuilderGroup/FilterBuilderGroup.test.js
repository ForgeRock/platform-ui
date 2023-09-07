/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FilterBuilderGroup from './index';
import { defaultConditionOptions, operatorOptions } from '../../utils/QueryFilterDefaults';

const mountProps = {
  global: {
    mocks: {
      $t: () => {},
      $store: {
        state: {
          userId: 'foo',
        },
      },
    },
  },
  props: {
    conditionOptions: defaultConditionOptions,
    depth: 0,
    disabled: false,
    hasSiblings: false,
    index: 0,
    maxDepth: 4,
    operatorOptions,
    path: '0',
    properties: [
      { label: 'Username', value: '/userName', type: 'string' },
      { label: 'First Name', value: '/givenName', type: 'string' },
      { label: 'Last Name', value: '/sn', type: 'string' },
      { label: 'Email Address', value: '/mail', type: 'string' },
      { label: 'Description', value: '/description', type: 'string' },
      { label: 'Status', value: '/accountStatus', type: 'string' },
      { label: 'Telephone Number', value: '/telephoneNumber', type: 'string' },
      { label: 'Address 1', value: '/postalAddress', type: 'string' },
      { label: 'City', value: '/city', type: 'string' },
      { label: 'Postal Code', value: '/postalCode', type: 'string' },
      { label: 'Country', value: '/country', type: 'string' },
      { label: 'State/Province', value: '/stateProvince', type: 'string' },
      { label: 'Preferences/updates', value: '/preferences/updates', type: 'boolean' },
      { label: 'Preferences/marketing', value: '/preferences/marketing', type: 'boolean' },
    ],
    resourceName: 'user',
    rules: {
      field: '/userName',
      operator: 'co',
      uniqueIndex: 2,
      value: 'test',
    },
  },
};
const newRule = {
  depth: -1, index: 0, path: '0', type: 'foo',
};

describe('FilterBuilderGroup', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FilterBuilderGroup, mountProps);
  });

  it('Creates object to add a rule', () => {
    const addRuleSpy = jest.spyOn(wrapper.vm, 'addRule');
    wrapper.vm.addRuleHandler('foo');
    expect(addRuleSpy).toHaveBeenCalledWith(newRule);
  });

  it('Emits the correct event with the correct arguments when adding a rule', () => {
    wrapper.vm.addRule(newRule);
    expect(wrapper.emitted()['add-rule']).toBeTruthy();
    expect(wrapper.emitted()['add-rule'][0][0]).toEqual(newRule);
  });

  it('Forms an object and emits an event if none passed to remove rule', () => {
    wrapper.vm.removeRule();
    expect(wrapper.emitted()['remove-rule']).toBeTruthy();
    expect(wrapper.emitted()['remove-rule'][0][0]).toEqual({ depth: -1, index: 0, path: '0' });
  });

  it('Forms an object and emits an event if none passed to remove rule', () => {
    wrapper.vm.removeRule('foo');
    expect(wrapper.emitted()['remove-rule']).toBeTruthy();
    expect(wrapper.emitted()['remove-rule'][0][0]).toEqual('foo');
  });

  it('emits a change event with the proper arguments', () => {
    wrapper.vm.ruleChange('foo');
    expect(wrapper.emitted()['rule-change']).toBeTruthy();
    expect(wrapper.emitted()['rule-change'][0][0]).toEqual('foo');
  });

  it('Emits operator change event if missing depth', () => {
    wrapper.vm.operatorChange('foo');
    expect(wrapper.emitted()['operator-change']).toBeTruthy();
    expect(wrapper.emitted()['operator-change'][0][0]).toEqual({ depth: 0, path: '0', value: 'foo' });
  });

  it('Emits remove rule', () => {
    wrapper.vm.operatorChange(newRule);
    expect(wrapper.emitted()['operator-change']).toBeTruthy();
    expect(wrapper.emitted()['operator-change'][0][0]).toEqual(newRule);
  });
});
