/**
 * Copyright (c) 2019-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import PolicyPanel from '@forgerock/platform-shared/src/components/PolicyPanel';
import { findAllByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';

let wrapper;

describe('PolicyPanel.vue', () => {
  beforeEach(() => {
    wrapper = shallowMount(PolicyPanel, {
      props: {
        policies: [
          { policyRequirement: 'test', params: { args: 'test args' } },
          { policyRequirement: 'test2', params: { args: 'test args' } },
          { policyRequirement: 'test3', params: { 'argu-ments': 'test args' } },
        ],
        policyFailures: ['test'],
      },
      global: {
        mocks: {
          $t: jest.fn().mockImplementation((path) => path),
        },
        renderStubDefaultSlot: true,
      },
    });
  });

  describe('proper render', () => {
    it('should not show anything when "policyFailures" is loading', () => {
      wrapper.setProps({ policyFailures: ['loading'] });

      expect(wrapper.find('ul').exists()).toBe(true);
      expect(wrapper.find('div.alert').exists()).toBe(false);
    });

    it('Will show all policies as passing when failedRules is empty', async () => {
      await wrapper.setProps({ policyFailures: [], valueEntered: true });

      expect(wrapper.classes('.text-muted')).toBe(false);
      const passingPoliciesArray = wrapper.findAll('.fr-valid');
      expect(passingPoliciesArray.length).toBe(3);
    });

    it('Will show all policies as failing when failedRules matches rules', async () => {
      await wrapper.setProps({ policyFailures: ['test', 'test2', 'test3'] });
      const passingPoliciesArray = wrapper.findAll('.fr-valid');
      expect(passingPoliciesArray.length).toBe(0);
    });

    it('Will add proper accessible data to the DOM to indicate policy failures', async () => {
      await wrapper.setProps({ policyFailures: ['test', 'test2', 'test3'] });
      await wrapper.setProps({ touched: true });
      const passedPolicies = findAllByTestId(wrapper, 'passed-policy');
      const failedPolicies = findAllByTestId(wrapper, 'failed-policy');

      expect(passedPolicies.length).toBe(0);
      expect(failedPolicies.length).toBe(3);

      expect(failedPolicies[0].classes()).toContain('sr-only');
    });

    it('Will add proper accessible data to the DOM to indicate a mix of policy failures and passes', async () => {
      await wrapper.setProps({ policyFailures: ['test2'], valueEntered: true });
      await wrapper.setProps({ touched: true });
      const passedPolicies = findAllByTestId(wrapper, 'passed-policy');
      const failedPolicies = findAllByTestId(wrapper, 'failed-policy');

      expect(passedPolicies.length).toBe(2);
      expect(failedPolicies.length).toBe(1);

      expect(passedPolicies[0].classes()).toContain('sr-only');
      expect(failedPolicies[0].classes()).toContain('sr-only');
    });

    it('Will add proper accessible data to the DOM to indicate policy passes', async () => {
      await wrapper.setProps({ policyFailures: [], valueEntered: true });
      await wrapper.setProps({ touched: true });
      const passedPolicies = findAllByTestId(wrapper, 'passed-policy');
      const failedPolicies = findAllByTestId(wrapper, 'failed-policy');

      expect(passedPolicies.length).toBe(3);
      expect(failedPolicies.length).toBe(0);

      expect(passedPolicies[0].classes()).toContain('sr-only');
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

  describe('formatting policy params for vue-i18n 9.x onwards', () => {
    it('removes hyphens from policy parameters so that they can be interpolated correctly', () => {
      expect(wrapper.vm.$t.mock.calls).toEqual([
        ['common.policyValidationMessages.test', { args: 'test args' }],
        ['common.policyValidationMessages.test2', { args: 'test args' }],
        ['common.policyValidationMessages.test3', { arguments: 'test args' }],
      ]);
    });
  });
});
