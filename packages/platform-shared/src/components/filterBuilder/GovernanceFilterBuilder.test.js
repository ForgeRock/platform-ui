/**
 * Copyright (c) 2022-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import GovernanceFilterBuilder from './GovernanceFilterBuilder';
import i18n from '@/i18n';

jest.mock('@/api/governance/CommonsApi', () => ({
  getResource: () => Promise.resolve({
    data: {
      result: [
        {
          givenName: 'Micheal',
          id: 'da678a7f-7e1f-46bb-841d-768553951b71',
          mail: 'lamgu@ukpil.edu',
          sn: 'Cummings',
          userName: 'AnJOLZHIHy',
        },
      ],
    },
  }),
}));

const subFilters1 = {
  operator: 'contains', field: '', value: '', uniqueIndex: 2, temporalValue: 'after',
};
const subFilters2 = {
  operator: 'equals', field: 'sn', value: 'name', uniqueIndex: 3, temporalValue: 'after',
};
const subFilters2Not = {
  operator: 'not_equals', field: 'sn', value: 'name', uniqueIndex: 1, temporalValue: 'before',
};
const subFilterStartsWith = {
  operator: 'starts_with', field: 'sn', value: 'name', uniqueIndex: 1, temporalValue: 'before',
};
const subFilters3 = {
  operator: 'equals', field: 'sn', value: 'name', uniqueIndex: 1, temporalValue: 'after',
};
const subFilters3Not = {
  operator: 'not_equals', field: 'sn', value: 'name', uniqueIndex: 1, temporalValue: 'before',
};
const subFilters4 = {
  operator: 'equals', field: 'sn', value: 'name', uniqueIndex: 4, temporalValue: 'before',
};

describe('GovernanceFilterBuilder', () => {
  function mountComponent(props, overrideData = {}) {
    const wrapper = mount(GovernanceFilterBuilder, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            state: {
              SharedStore: {
                workforceEnabled: true,
              },
            },
          },
        },
      },
      props: {
        disabled: false,
        resourceName: 'user',
        properties: [{ value: 'sn' }, { value: 'testnumber', type: 'number' }],
        filterValue: {},
        hideGroup: false,
        prefixGroupText: 'prefixGroupText',
        showTemporalValueField: true,
        ...props,
      },
    });
    wrapper.setData(overrideData);
    return wrapper;
  }

  describe('Unit tests', () => {
    it('Creates default group', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.getDefaultGroup()).toEqual({ subfilters: [subFilters1], operator: 'or', uniqueIndex: 3 });

      expect(wrapper.vm.getDefaultGroup([subFilters4])).toEqual({
        subfilters: [subFilters4], operator: 'or', uniqueIndex: 4,
      });
    });

    it('Creates default rule', () => {
      const wrapper = mountComponent();
      expect(wrapper.vm.getDefaultRule()).toEqual(subFilters1);
      expect(wrapper.vm.getDefaultRule('after', 'sn', 'equals', 'name')).toEqual(subFilters2);
    });

    it('Creates unique index', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.uniqueIndex = 0;
      expect(wrapper.vm.getUniqueIndex()).toEqual(1);
    });
  });

  describe('Component tests', () => {
    it('Updates filter with new group', async () => {
      const filterBefore = { filterValue: { or: [{ equals: { right: { literal: 'name' }, left: 'user.after.sn' } }] } };
      const wrapper = mountComponent(filterBefore);
      await flushPromises();
      const addRule = {
        depth: 0, index: 0, path: '0', value: { field: 'sn' },
      };
      const filterAfter = {
        subfilters: [subFilters3, { operator: 'or', subfilters: [subFilters1], uniqueIndex: 3 }],
        operator: 'or',
        uniqueIndex: 0,
      };

      const filterBuilderGroup = wrapper.findComponent('.pb-3.background-none');
      filterBuilderGroup.vm.$emit('add-rule', addRule);
      expect(wrapper.vm.queryFilter).toEqual(filterAfter);
    });

    it('Updates filter with new rule', async () => {
      const filterBefore = { filterValue: { or: [{ equals: { right: { literal: 'name' }, left: 'user.after.sn' } }] } };
      const wrapper = mountComponent(filterBefore);
      await flushPromises();
      const addRule = {
        depth: 0, index: 0, path: '0', value: { field: 'sn' }, type: 'row',
      };
      const filterAfter = {
        subfilters: [subFilters3, subFilters1],
        operator: 'or',
        uniqueIndex: 0,
      };

      const filterBuilderGroup = wrapper.findComponent('.pb-3.background-none');
      filterBuilderGroup.vm.$emit('add-rule', addRule);
      expect(wrapper.vm.queryFilter).toEqual(filterAfter);
    });

    it('Updates filter with operator change', () => {
      const filterBefore = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] } };
      const wrapper = mountComponent(filterBefore);
      const ruleChange = {
        depth: 0, path: '0', value: 'and',
      };
      const filterAfter = { subfilters: [subFilterStartsWith], operator: 'and', uniqueIndex: 0 };

      const filterBuilderGroup = wrapper.findComponent('.pb-3.background-none');
      filterBuilderGroup.vm.$emit('operator-change', ruleChange);
      expect(wrapper.vm.queryFilter).toEqual(filterAfter);
    });

    it('Updates nothing if incorrect event name is passed', () => {
      const filterBefore = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] } };
      const wrapper = mountComponent(filterBefore);
      const ruleChange = {
        depth: 0, path: '0', value: 'and',
      };
      const filterAfter = { subfilters: [subFilterStartsWith], operator: 'or', uniqueIndex: 0 };

      // have to call directly as there is no event linked to this specific event
      wrapper.vm.updateFilter('invalid-event-name', ruleChange);
      expect(wrapper.vm.queryFilter).toEqual(filterAfter);
    });

    it('Updates filter with rule change', () => {
      const filterBefore = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] } };
      const wrapper = mountComponent(filterBefore);
      const ruleChange = {
        depth: 0, index: 0, path: '0', value: { operator: 'not_equals' },
      };
      const filterAfter = { subfilters: [subFilters2Not], operator: 'or', uniqueIndex: 0 };

      const filterBuilderGroup = wrapper.findComponent('.pb-3.background-none');
      filterBuilderGroup.vm.$emit('rule-change', ruleChange);
      expect(wrapper.vm.queryFilter).toEqual(filterAfter);
    });

    it('Updates filter by removing rule', () => {
      const filterBefore = {
        filterValue: {
          or: [
            {
              not_equals: {
                right: {
                  literal: 'name',
                },
                left: 'user.before.sn',
              },
            },
            {
              equals: {
                right: {
                  literal: 'active',
                },
                left: 'user.before.accountStatus',
              },
            },
          ],
        },
      };
      const wrapper = mountComponent(filterBefore);
      const removeRule = { depth: 0, index: 1, path: '0' };
      const filterAfter = { operator: 'or', subfilters: [subFilters3Not], uniqueIndex: 0 };

      const filterBuilderGroup = wrapper.findComponent('.pb-3.background-none');
      filterBuilderGroup.vm.$emit('remove-rule', removeRule);
      expect(wrapper.vm.queryFilter).toEqual(filterAfter);
    });

    it('toggles between basic and advanced editor', async () => {
      const initialFilter = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] } };
      const wrapper = mountComponent(initialFilter);

      expect(wrapper.find('.fr-script-editor').exists()).toBe(false);
      const advancedButton = wrapper.findAllComponents('button').filter((item) => item.text().includes('Advanced Editor'))[0];
      advancedButton.trigger('click');
      await flushPromises();
      expect(wrapper.find('.fr-script-editor').exists()).toBe(true);
      const basicButton = wrapper.findAllComponents('button').filter((item) => item.text().includes('Basic Editor'))[0];
      basicButton.trigger('click');
      await flushPromises();
      expect(wrapper.find('.fr-script-editor').exists()).toBe(false);
    });

    it('parses and checks filter string', async () => {
      const initialFilter = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] } };
      const wrapper = mountComponent(initialFilter);

      const advancedButton = wrapper.findAllComponents('button').filter((item) => item.text().includes('Advanced Editor'))[0];
      advancedButton.trigger('click');
      await flushPromises();
      wrapper.findComponent('.form-group').vm.$emit('input', { source: '{"filterString":"stringValue"}' });
      expect(wrapper.emitted('filter-update')[0]).toEqual([{ filterString: 'stringValue' }]);
    });

    it('Should validate for before/after properties if showTemporalValueField is true', async () => {
      const filterBeforeProps = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] } };
      const wrapper = mountComponent(filterBeforeProps);
      const ruleChange = {
        depth: 0, index: 0, path: '0', value: { operator: 'not_equals' },
      };

      const filterBuilderGroup = wrapper.findComponent('.pb-3.background-none');
      filterBuilderGroup.vm.$emit('rule-change', ruleChange);
      await flushPromises();
      expect(wrapper.find('[role="alert"] .iga-error').exists()).toBe(true);
    });

    it('Should not validate for before/after properties if showTemporalValueField is false', async () => {
      const filterBeforeProps = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] }, showTemporalValueField: false };
      const wrapper = mountComponent(filterBeforeProps);
      const ruleChange = {
        depth: 0, index: 0, path: '0', value: { operator: 'not_equals' },
      };

      const filterBuilderGroup = wrapper.findComponent('.pb-3.background-none');
      filterBuilderGroup.vm.$emit('rule-change', ruleChange);
      await flushPromises();
      expect(wrapper.find('[role="alert"] .iga-error').exists()).toBe(false);
    });

    it('Filter operators are properly loaded for numeric condition', async () => {
      const initialFilter = {
        filterValue: {
          or: [{
            equals: {
              right: {
                literal: 10,
              },
              left: 'user.after.testnumber',
            },
          }],
        },
      };
      // const initialFilter = { filterValue: { or: [{ starts_with: { prefix: { literal: 'name' }, value: 'user.before.sn' } }] } };
      const wrapper = mountComponent(initialFilter);
      await flushPromises();

      const ruleCondition = wrapper.find('#ruleCondition_user_1');
      const operatorList = ruleCondition.findAll('li').filter((element) => !element.attributes('style'));

      expect(operatorList.length).toBe(8);
      expect(operatorList[0].text()).toBe('is');
      expect(operatorList[1].text()).toBe('is not');
      expect(operatorList[2].text()).toBe('has changed');
      expect(operatorList[3].text()).toBe('has not changed');
      expect(operatorList[4].text()).toBe('GTE (>=)');
      expect(operatorList[5].text()).toBe('GT (>)');
      expect(operatorList[6].text()).toBe('LTE (<=)');
      expect(operatorList[7].text()).toBe('LT (<)');
    });

    it('Change numeric condition value should emit properly filter-update event', async () => {
      const initialFilter = {
        showTemporalValueField: false,
        filterValue: {
          or: [{
            equals: {
              right: {
                literal: 10,
              },
              left: 'user.after.testnumber',
            },
          }],
        },
      };
      const wrapper = mountComponent(initialFilter);
      await flushPromises();

      const inputValue = wrapper.find('input[name="inputValue_user_1"]');
      await inputValue.setValue(20);
      await inputValue.trigger('blur');

      expect(wrapper.emitted('filter-update')).toBeTruthy();
      // Initial emit is the string representation that happens on keypress (setValue).
      // Second emit is the blur event which updates the string number value to an integer.
      expect(wrapper.emitted('filter-update').length).toBe(2);
      expect(wrapper.emitted('filter-update')[1][0]).toEqual({
        or: [{
          equals: {
            right: {
              literal: 20,
            },
            left: 'user.after.testnumber',
          },
        }],
      });
    });

    it('should add correctly a managed object id to the filter', async () => {
      const wrapper = mountComponent({
        properties: [
          {
            label: 'manager',
            value: 'user.manager',
            type: 'reference',
            path: '/openidm/managed/alpha_user',
          },
        ],
      });
      await flushPromises();

      const selectField = wrapper.find('#ruleProperty_selectPropOptions_user_1');
      await selectField.find('.multiselect__content .multiselect__option').trigger('click');

      expect(wrapper.vm.queryFilter).toEqual({
        operator: 'or',
        subfilters: [
          {
            operator: 'equals',
            uniqueIndex: 1,
            field: 'user.manager',
            value: 'da678a7f-7e1f-46bb-841d-768553951b71',
            temporalValue: 'after',
          },
        ],
        uniqueIndex: 0,
      });
    });

    it('should add correctly a managed object id for a glossary property to the filter', async () => {
      const wrapper = mountComponent({
        resourceName: 'application',
        properties: [
          {
            label: 'owner',
            value: 'catalog.application.glossary.owner',
            type: 'reference',
            path: '/openidm/managed/application',
          },
        ],
      });
      await flushPromises();

      const selectField = wrapper.find('#ruleProperty_selectPropOptions_application_1');
      await selectField.find('.multiselect__content .multiselect__option').trigger('click');

      expect(wrapper.vm.queryFilter).toEqual({
        operator: 'or',
        subfilters: [
          {
            operator: 'equals',
            uniqueIndex: 1,
            field: 'catalog.application.glossary.owner',
            value: 'managed/application/da678a7f-7e1f-46bb-841d-768553951b71',
            temporalValue: 'after',
          },
        ],
        uniqueIndex: 0,
      });
    });
  });
});
