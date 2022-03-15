/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FilterBuilderRow from './index';

const mountProps = {
  mocks: {
    $t: () => {},
    $store: {
      state: {
        userId: 'foo',
      },
    },
  },
  propsData: {
    depth: 0,
    index: 0,
    hasSiblings: false,
    maxDepth: 4,
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
    rule: {
      field: '/userName',
      operator: 'co',
      uniqueIndex: 2,
      value: 'test',
    },
  },
};

describe('FilterBuilderRow', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FilterBuilderRow, mountProps);
  });

  it('FilterBuilderRow successfully loaded', () => {
    expect(wrapper.name()).toEqual('FilterBuilderRow');
  });

  it('Initial rule renders the correct values', () => {
    // Property
    let rowFormElement = wrapper.find(
      '.depth-1.queryfilter-row:first-child .form-row > .rule-property-col .multiselect__single',
    ).text();
    expect(rowFormElement).toEqual('Username');

    // Condition
    rowFormElement = wrapper.find(
      '.depth-1.queryfilter-row:first-child .form-row > .rule-condition-col .multiselect__single',
    ).text();
    expect(rowFormElement).toEqual('contains');

    // Value
    rowFormElement = wrapper.find(
      '.depth-1.queryfilter-row:first-child .form-row > .rule-value-col input',
    ).element.value;
    expect(rowFormElement).toEqual('test');
  });

  it('Returns the correct select options by type (String)', () => {
    const returnObject = wrapper.vm.conditionOptionsByType('string');
    expect(returnObject).toEqual(
      [
        { text: 'contains', value: 'co' },
        { text: 'does not contain', value: '!co' },
        { text: 'is ', value: 'eq' },
        { text: 'is not', value: '!eq' },
        { text: 'is present', value: 'pr' },
        { text: 'is not present', value: '!pr' },
        { text: 'starts with', value: 'sw' },
        { text: 'does not start with', value: '!sw' },
      ],
    );
  });

  it('Returns the correct select options by type (Number)', () => {
    const returnObject = wrapper.vm.conditionOptionsByType('number');
    expect(returnObject).toEqual(
      [
        { text: 'is ', value: 'eq' },
        { text: 'is not', value: '!eq' },
        { text: 'is present', value: 'pr' },
        { text: 'is not present', value: '!pr' },
        { text: 'GTE (>=)', value: 'ge' },
        { text: 'GT (>)', value: 'gt' },
        { text: 'LTE (<=)', value: 'le' },
        { text: 'LT (<)', value: 'lt' },
      ],
    );
  });

  it('Returns the correct select options by type (Boolean)', () => {
    const returnObject = wrapper.vm.conditionOptionsByType('boolean');
    expect(returnObject).toEqual(
      [
        { text: 'is ', value: 'eq' },
        { text: 'is present', value: 'pr' },
        { text: 'is not present', value: '!pr' },
      ],
    );
  });

  it('Initial rule renders without a value', () => {
    const presentWrapper = mount(FilterBuilderRow, {
      ...mountProps,
      propsData: {
        ...mountProps.propsData,
        rule: {
          field: '/userName', operator: 'pr', uniqueIndex: 2, value: '',
        },
      },
    });
    const valueExists = presentWrapper.find(
      '.depth-1.queryfilter-row:first-child .form-row > .rule-value-col',
    ).exists();
    expect(valueExists).toBe(false);
  });

  it('Emits add rule', async () => {
    wrapper.vm.addRule();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['add-rule']).toBeTruthy();
  });

  it('Emits remove rule', async () => {
    wrapper.vm.removeRule();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['remove-rule']).toBeTruthy();
  });
});
