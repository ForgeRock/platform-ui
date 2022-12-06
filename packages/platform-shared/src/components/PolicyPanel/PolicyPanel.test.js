/**
 * Copyright (c) 2019-2022 ForgeRock. All rights reserved.
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
          { policyRequirement: 'test', params: { args: 'test args' } },
          { policyRequirement: 'test2', params: { args: 'test args' } },
          { policyRequirement: 'test3', params: { args: 'test args' } },
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
      wrapper.setProps({ policyFailures: [], valueEntered: 'test' });
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
      { policyRequirement: 'test1' },
      { policyRequirement: 'test2' },
      { policyRequirement: 'test3' },
      { policyRequirement: 'test4' },
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
