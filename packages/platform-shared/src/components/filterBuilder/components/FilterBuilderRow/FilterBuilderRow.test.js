/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import FilterBuilderRow from './index';
import { defaultConditionOptions } from '../../utils/QueryFilterDefaults';
import * as CertFilterDefaults from '../../CertificationFilter/CertFilterDefaults';
import i18n from '@/i18n';

const mountProps = {
  global: {
    mocks: {
      $t: (t) => t,
      $store: {
        state: {
          userId: 'foo',
        },
      },
    },
  },
  props: {
    operatorOptions: defaultConditionOptions,
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
      { label: 'testBoolean', type: 'boolean', value: 'glossary.testBoolean' },
    ],
    resourceName: 'user',
    rule: {
      field: '/userName',
      operator: 'co',
      uniqueIndex: 2,
      value: 'test',
    },
    booleanValueType: 'boolean',
  },
};

function mountComponent(props, slots) {
  const wrapper = mount(FilterBuilderRow, {
    slots: {
      ...slots,
    },
    global: {
      plugins: [i18n],
      mocks: {
        $store: {
          state: {
            userId: 'foo',
          },
        },
      },
    },
    props: {
      operatorOptions: defaultConditionOptions,
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
        { label: 'testBoolean', type: 'boolean', value: 'glossary.testBoolean' },
      ],
      resourceName: 'user',
      rule: {
        field: '/userName',
        operator: 'co',
        uniqueIndex: 2,
        value: 'test',
      },
      booleanValueType: 'boolean',
      ...props,
    },
  });
  return wrapper;
}

describe('FilterBuilderRow', () => {
  describe('Default mount', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(FilterBuilderRow, mountProps);
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

    it('should emit the rule-change and then clear the value input through the props', async () => {
      // set the input initial value
      const inputFieldValue = wrapper.find('input[name="inputValue_user_2"]');
      inputFieldValue.setValue('Initial Value');

      // simulates the dropdown change
      const propertySelector = wrapper.find('input[name="selectPropOptions_user_2"]');
      propertySelector.setValue('Status');
      propertySelector.trigger('change');

      // emit the function which is the one will update the value for all inputs using the props
      await flushPromises();
      expect(wrapper.emitted()['rule-change']).toBeTruthy();

      // set the external props to execute the rule watch which is the one who clear the input value
      await wrapper.setProps({
        rule: { field: 'Status' },
      });

      // review the new values
      expect(inputFieldValue.element.value).toEqual('');
      expect(propertySelector.element.value).toBe('Status');
    });

    it('Returns the correct select options by type (String)', () => {
      const returnObject = wrapper.vm.conditionOptionsByType('string');
      expect(returnObject).toEqual(
        [
          { text: 'contains', value: 'co' },
          { text: 'does not contain', value: '!co' },
          { text: 'is', value: 'eq' },
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
          { text: 'is', value: 'eq' },
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

    it('Returns the correct select options by type (Int)', async () => {
      await wrapper.setProps({
        operatorOptions: CertFilterDefaults.defaultConditionOptions,
      });

      const returnObject = wrapper.vm.conditionOptionsByType('int');
      expect(returnObject).toEqual(
        [
          { text: 'is', value: 'EQUALS' },
          { text: 'GTE (>=)', value: 'GTE' },
          { text: 'GT (>)', value: 'GT' },
          { text: 'LTE (<=)', value: 'LTE' },
          { text: 'LT (<)', value: 'LT' },
        ],
      );
    });

    it('Returns the correct select options by type (Boolean)', () => {
      const returnObject = wrapper.vm.conditionOptionsByType('boolean');
      expect(returnObject).toEqual(
        [
          { text: 'is', value: 'eq' },
          { text: 'is present', value: 'pr' },
          { text: 'is not present', value: '!pr' },
        ],
      );
    });

    it('Initial rule renders without a value', () => {
      const presentWrapper = mount(FilterBuilderRow, {
        ...mountProps,
        props: {
          ...mountProps.props,
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

    describe('parseType', () => {
      it('returns type string for empty input', () => {
        const result = wrapper.vm.parseType(null);
        expect(result).toEqual({ type: 'string', value: '' });
      });

      it('parses boolean type correctly', () => {
        jest.mock('../../utils/QueryFilterDefaults', () => ({
          getTypeFromValue: jest.fn().mockReturnValue('boolean'),
        }));

        const result = wrapper.vm.parseType('glossary.testBoolean', false);
        expect(result).toEqual({
          type: 'select',
          value: false,
          options: [{ value: true, text: 'common.true' }, { value: false, text: 'common.false' }],
        });
      });
    });
  });

  describe('Custom Mount', () => {
    it('Does not render the operator slot when slot is not passed in from child', async () => {
      const wrapper = mountComponent({}, {});
      await flushPromises();
      expect(wrapper.find('.filter-builder-row p').exists()).toBe(false);
    });

    it('Renders the operator slot when slot is passed in from child', async () => {
      const wrapper = mountComponent({}, {
        operatorField: '<p>testOperatorSlot</p>',
      });
      await flushPromises();
      expect(wrapper.find('.filter-builder-row p').text()).toBe('testOperatorSlot');
    });
  });
});
