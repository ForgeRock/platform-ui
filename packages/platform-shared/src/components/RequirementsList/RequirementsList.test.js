/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import RequirementsList from './index';

describe('RequirementsList Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(RequirementsList, {
      sync: false,
      mocks: {
        $t: (value) => value,
      },
      propsData: {
        numColumns: 1,
        rules: { requireNumber: true, required: true, requireSymbol: true },
        failedRules: { requireNumber: 'failed' },
      },
    });
  });

  it('RequirementsList successfully loaded', () => {
    expect(wrapper.name()).toEqual('RequirementsList');
  });

  it('Will show failed policies in normal text', () => {
    expect(wrapper.find('.text-muted').text()).toBe('passwordPolicy.requireNumber');
  });

  it('Will show passing policies in a light gray text', () => {
    expect(wrapper.find('.opacity-30').text()).toBe('passwordPolicy.required');
  });

  it('Will redistribute policies when the number of columns changes', () => {
    wrapper.setProps({ numColumns: 3 });
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.numPolicies).toBe(3);
      expect(wrapper.vm.policyColumns.length).toBe(3);
    });
  });

  it('Will show all policies as passing when failedRules is empty', () => {
    wrapper.setProps({ failedRules: {} });
    wrapper.vm.$nextTick(() => {
      expect(wrapper.classes('.text-muted')).toBe(false);
      const passingPoliciesArray = wrapper.findAll('.opacity-30');
      expect(passingPoliciesArray.at(0).is('.opacity-30')).toBe(true);
      expect(passingPoliciesArray.at(1).is('.opacity-30')).toBe(true);
      expect(passingPoliciesArray.at(2).is('.opacity-30')).toBe(true);
    });
  });

  it('Will show all policies as failing when failedRules matches rules', () => {
    wrapper.setProps({ failedRules: { requireNumber: true, required: true, requireSymbol: true } });
    wrapper.vm.$nextTick(() => {
      expect(wrapper.classes('.opacity-30')).toBe(false);
      const failedPoliciesArray = wrapper.findAll('.text-muted');
      expect(failedPoliciesArray.at(0).is('.text-muted')).toBe(true);
      expect(failedPoliciesArray.at(1).is('.text-muted')).toBe(true);
      expect(failedPoliciesArray.at(2).is('.text-muted')).toBe(true);
    });
  });

  describe('getPolicyColumns()', () => {
    const policyList = {
      required: 'true',
      requireSymbol: 'true',
      requireNumber: 'true',
      test: 'true',
    };

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
