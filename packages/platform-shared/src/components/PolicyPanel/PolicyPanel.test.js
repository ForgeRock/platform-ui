/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

let wrapper;

describe('PolicyPanel.vue', () => {
  beforeEach(() => {
    wrapper = shallowMount(PolicyPanel, {
      localVue,
      propsData: {
        policies: [
          { name: 'test', params: { args: 'test args' } },
          { name: 'test2', params: { args: 'test args' } },
          { name: 'test3', params: { args: 'test args' } },
        ],
        policyFailures: ['test'],
      },
      mocks: {
        $t: (path) => path,
      },
    });
  });

  it('PolicyPanel component loaded', () => {
    expect(wrapper.name()).toBe('PolicyPanel');
  });

  describe('proper render', () => {
    it('should not show anything when "policyFailures" is loading', () => {
      wrapper.setProps({ policyFailures: 'loading' });

      expect(wrapper.contains('ul')).toBe(true);
      expect(wrapper.contains('div.alert')).toBe(false);
    });

    it('Will show all policies as passing when failedRules is empty', () => {
      wrapper.setProps({ policyFailures: [] });
      wrapper.vm.$nextTick(() => {
        expect(wrapper.classes('.text-muted')).toBe(false);
        const passingPoliciesArray = wrapper.findAll('.fr-valid');
        expect(passingPoliciesArray.length).toBe(3);
      });
    });

    it('Will show all policies as failing when failedRules matches rules', () => {
      wrapper.setProps({ policyFailures: ['test', 'test2', 'test3'] });
      wrapper.vm.$nextTick(() => {
        const passingPoliciesArray = wrapper.findAll('.fr-valid');
        expect(passingPoliciesArray.length).toBe(0);
      });
    });
  });

  describe('getPolicyColumns()', () => {
    const policyList = [
      { name: 'test1' },
      { name: 'test2' },
      { name: 'test3' },
      { name: 'test4' },
    ];

    it('Will put all policies in one column', () => {
      const columns = wrapper.vm.getPolicyColumns(policyList, 1);
      expect(columns.length).toEqual(1);
      expect(columns[0].length).toBe(4);
    });

    it('Will split policies between two columns', () => {
      const columns = wrapper.vm.getPolicyColumns(policyList, 2);
      expect(columns.length).toEqual(2);
      expect(columns[0].length).toBe(2);
      expect(columns[1].length).toBe(2);
    });

    it('Will split policies between three columns', () => {
      const columns = wrapper.vm.getPolicyColumns(policyList, 3);
      expect(columns.length).toEqual(3);
      expect(columns[0].length).toBe(2);
      expect(columns[1].length).toBe(1);
      expect(columns[2].length).toBe(1);
    });
  });
});
