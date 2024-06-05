/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import CertificationFilter from './index';
import i18n from '@/i18n';

describe('CertificationFilter', () => {
  let wrapper;

  function mountComponent({ props }) {
    return shallowMount(CertificationFilter, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props,
    });
  }

  describe('no filter, default behaviour', () => {
    beforeEach(() => {
      wrapper = mountComponent({
        props: {
          resourceName: 'test',
          filter: {},
        },
      });
    });

    it('gets the correct default group', () => {
      const group = wrapper.vm.getDefaultGroup();
      expect(group).toEqual({
        subfilters: [
          {
            operator: 'EQUALS',
            field: '',
            value: '',
            uniqueIndex: 3,
          },
        ],
        operator: 'OR',
        uniqueIndex: 4,
      });
    });

    it('gets the correct default rule', () => {
      const rule = wrapper.vm.getDefaultRule();
      expect(rule).toEqual({
        operator: 'EQUALS',
        field: '',
        value: '',
        uniqueIndex: 3,
      });
    });

    it('calculates a unique index', () => {
      let index = wrapper.vm.getUniqueIndex();
      expect(index).toBe(3);
      index = wrapper.vm.getUniqueIndex();
      expect(index).toBe(4);
      index = wrapper.vm.getUniqueIndex();
      expect(index).toBe(5);
    });

    it('emits an event when the filter is updated', () => {
      wrapper.vm.queryFilter = {
        filter: 'test',
      };

      expect(wrapper.emitted()['filter-update'][0][0]).toBeTruthy();
    });
  });

  describe('with filter', () => {
    beforeEach(() => {
      wrapper = mountComponent({
        props: {
          resourceName: 'test',
          filter: {
            operator: 'OR',
            operand: [
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'glossary.active',
                  targetValue: 'False',
                },
              },
              {
                operator: 'CONTAINS',
                operand: {
                  targetName: 'name',
                  targetValue: 'test',
                },
              },
              {
                operator: 'OR',
                operand: [
                  {
                    operator: 'EQUALS',
                    operand: {
                      targetName: 'glossary.customAttribute1',
                      targetValue: 'test',
                    },
                  },
                  {
                    operator: 'OR',
                    operand: [
                      {
                        operator: 'CONTAINS',
                        operand: {
                          targetName: 'description',
                          targetValue: 'test',
                        },
                      },
                    ],
                  },
                  {
                    operator: 'OR',
                    operand: [
                      {
                        operator: 'GTE',
                        operand: {
                          targetName: 'glossary.startDate',
                          targetValue: '2023-03-07',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      });
    });

    it('query filter correctly generated', () => {
      expect(wrapper.vm.queryFilter).toEqual({
        operator: 'OR',
        subfilters: [
          {
            field: 'glossary.active',
            operator: 'EQUALS',
            uniqueIndex: 2,
            value: 'False',
          },
          {
            field: 'name',
            operator: 'CONTAINS',
            uniqueIndex: 3,
            value: 'test',
          },
          {
            operator: 'OR',
            subfilters: [
              {
                field: 'glossary.customAttribute1',
                operator: 'EQUALS',
                uniqueIndex: 5,
                value: 'test',
              },
              {
                operator: 'OR',
                subfilters: [
                  {
                    field: 'description',
                    operator: 'CONTAINS',
                    uniqueIndex: 7,
                    value: 'test',
                  },
                ],
                uniqueIndex: 6,
              },
              {
                operator: 'OR',
                subfilters: [
                  {
                    field: 'glossary.startDate',
                    operator: 'GTE',
                    uniqueIndex: 9,
                    value: '2023-03-07',
                  },
                ],
                uniqueIndex: 8,
              },
            ],
            uniqueIndex: 4,
          },
        ],
        uniqueIndex: 1,
      });
    });
  });

  describe('with entitlements filter', () => {
    it('should show the entitlements select component when the filter for entitlement.displayName is selected and the conditional operator is EQUALS', async () => {
      wrapper = mount(CertificationFilter, {
        global: {
          plugins: [i18n],
          stubs: ['EntitlementSelect'],
        },
        props: {
          resourceName: 'test',
          filter: {
            operator: 'OR',
            operand: [
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'entitlement.displayName',
                  targetValue: '',
                },
              },
            ],
          },
        },
      });
      await flushPromises();

      const entitlementSelect = wrapper.findComponent({ name: 'EntitlementSelect' });
      expect(entitlementSelect.exists()).toBe(true);
      expect(wrapper.vm.queryFilter).toEqual({
        operator: 'OR',
        subfilters: [{
          field: 'entitlement.displayName', operator: 'EQUALS', uniqueIndex: 2, value: '',
        }],
        uniqueIndex: 1,
      });
    });

    it('should not show the entitlements select component when the filter for entitlement.displayName is not selected', async () => {
      wrapper = mount(CertificationFilter, {
        global: {
          plugins: [i18n],
          stubs: ['EntitlementSelect'],
        },
        props: {
          resourceName: 'test',
          filter: {
            operator: 'OR',
            operand: [
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'entitlement.description',
                  targetValue: '',
                },
              },
            ],
          },
        },
      });
      await flushPromises();

      const entitlementSelect = wrapper.findComponent({ name: 'EntitlementSelect' });
      expect(entitlementSelect.exists()).toBe(false);
    });

    it('should change rule when the entitlementSelect component emmit a new value', async () => {
      wrapper = mount(CertificationFilter, {
        global: {
          plugins: [i18n],
          stubs: ['EntitlementSelect'],
        },
        props: {
          resourceName: 'test',
          filter: {
            operator: 'OR',
            operand: [
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'entitlement.displayName',
                  targetValue: '',
                },
              },
            ],
          },
        },
      });
      await flushPromises();

      const entitlementSelect = wrapper.findComponent({ name: 'EntitlementSelect' });
      await entitlementSelect.vm.$emit('update:modelValue', 'Entitlement name');
      await flushPromises();

      expect(wrapper.vm.queryFilter).toEqual({
        operator: 'OR',
        subfilters: [{
          field: 'entitlement.displayName', operator: 'EQUALS', uniqueIndex: 2, value: 'Entitlement name',
        }],
        uniqueIndex: 1,
      });
    });
  });
});
