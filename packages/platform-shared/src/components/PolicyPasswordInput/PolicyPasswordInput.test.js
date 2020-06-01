/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint-disable import/no-extraneous-dependencies */
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { includes } from 'lodash';
import PolicyPasswordInput from './index';

PolicyPasswordInput.created = jest.fn();

const localVue = createLocalVue();

describe('PasswordPolicyInput.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(PolicyPasswordInput, {
      localVue,
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: { policyApi: 'reset' },
    });
  });

  describe('proper render', () => {
    it('should load the page', () => {
      expect(wrapper.name()).toBe('PolicyPasswordInput');
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('#isPasswordPolicyItem', () => {
    it('Should return true for items that match "password" and then items that do not match "password" ', () => {
      let policyDefinition = { name: '/user/password' };


      let policyFailureDefinition = { property: '/user/password' };

      expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).toEqual(true);
      expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).toEqual(true);

      policyDefinition = { name: '/user/_id' };
      policyFailureDefinition = { property: '/user/_id' };

      expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).toEqual(false);
      expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).toEqual(false);
    });
  });

  describe('#toSimplePolicyObject', () => {
    it('should turn Policy Definition objcets into an object {name<String>, params<Object>}', () => {
      const policyDefinition = {
        policyId: 'at-least-X-numbers',
        params: { numNums: 1 },
        policyRequirements: ['AT_LEAST_X_NUMBERS'],
      };


      const simplePolicyObj = wrapper.vm.toSimplePolicyObject(policyDefinition);

      expect(simplePolicyObj).toHaveProperty('name');
      expect(simplePolicyObj.name).toEqual('AT_LEAST_X_NUMBERS');
      expect(simplePolicyObj).toHaveProperty('params');
      expect(simplePolicyObj.params).toEqual({ numNums: 1 });
    });

    it('should return an empty list for not well defined policy definitions', () => {
      const policyDefinition = {
        policyId: 'at-least-X-numbers',
        params: { numNums: 1 },
      };

      const simplePolicyObj = wrapper.vm.toSimplePolicyObject(policyDefinition);

      expect(simplePolicyObj).toEqual({});
    });
  });

  describe('#toPolicyNames', () => {
    it('should only return the name of a failed password property and fail on badly formed input', () => {
      const failedPolicySet = {
        failedPolicyRequirements: [
          {
            policyRequirements: [{
              params: { numNums: 1 },
              policyRequirement: 'AT_LEAST_X_NUMBERS',
            }],
            property: '/user/password',
          },
          {
            policyRequirements: [{
              policyRequirement: 'REQUIRED',
            }],
            property: '/user/mail',
          },
        ],
      };

      expect(wrapper.vm.toPolicyNames(failedPolicySet)).toEqual(['AT_LEAST_X_NUMBERS']);
      expect(wrapper.vm.toPolicyNames({})).toEqual([]);
    });
  });

  describe('#makeExclusions', () => {
    const policyRequirementSet = {
      policyRequirements: [
        'REQUIRED',
        'MIN_LENGTH',
      ],
      policies: [
        {
          policyRequirements: [
            'REQUIRED',
          ],
        },
        {
          policyRequirements: [
            'MIN_LENGTH',
          ],
        },
      ],
    };

    it('should remove policies with strings specified in "exclude" prop', () => {
      wrapper.setProps({ excludeOverwrite: ['REQUIRED'] });
      const unexcludedPolicies = wrapper.vm.makeExclusions(policyRequirementSet, wrapper.vm.$props.excludeOverwrite).policies;

      expect(unexcludedPolicies).toEqual([{ policyRequirements: ['MIN_LENGTH'] }]);
    });

    it('should remove policies specified as {name<String>, predicate<Function>} in "exclude" prop', () => {
      wrapper.setProps({
        excludeOverwrite: [{
          name: 'REQUIRED',
          predicate: (n) => includes(n, 'MIN_LENGTH'),
        }],
      });
      const unexcludedPolicies = wrapper.vm.makeExclusions(policyRequirementSet, wrapper.vm.$props.excludeOverwrite).policies;

      expect(unexcludedPolicies).toEqual([{ policyRequirements: ['MIN_LENGTH'] }]);
    });
  });
});
