/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import PasswordPolicyMixin from './index';
import i18n from '@/i18n';

let wrapper;
const minDictionaryChar = {
  data: {
    validator: [{
      _id: 'userPasswordPolicy-length-based-password-validator',
      maxPasswordLength: 0,
      minPasswordLength: 6,
    }, {
      _id: 'userPasswordPolicy-dictionary-password-validator',
    }, {
      _id: 'userPasswordPolicy-character-set-password-validator',
      allowUnclassifiedCharacters: true,
      characterSet: ['1:abcdefghijklmnopqrstuvwxyz', '1:ABCDEFGHIJKLMNOPQRSTUVWXYZ', '1:0123456789', "1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\"'\\`"],
    }],
  },
};

const lengthRepeated = {
  data: {
    validator: [{
      _id: 'userPasswordPolicy-length-based-password-validator',
      maxPasswordLength: 20,
      minPasswordLength: 6,
    }, {
      _id: 'userPasswordPolicy-repeated-characters-password-validator',
      maxConsecutiveLength: 2,
    }],
  },
};

describe('PasswordPolicyMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() {},
      global: {
        mixins: [PasswordPolicyMixin],
        mocks: {
        },
        plugins: [i18n],
      },
    });
  });

  describe('Ensure correct char policy messages are returned based on character sets', () => {
    it('Returns a policy based on sets- alpha sets', () => {
      const expectedPolicy = {
        policyRequirement: 'CHARACTER_SET',
        params: {
          sets: 'One lowercase character, one uppercase character',
        },
      };
      // the preceding 1/0 is the on/off switch- in this example, both lower and
      // upper alpha are required, numbers are not
      const policy = wrapper.vm.getPoliciesFromCharacterSet([
        '1:abcdefghijklmnopqrstuvwxyz',
        '1:ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '0:0123456789',
      ]);
      expect(policy).toStrictEqual(expectedPolicy);
    });

    it('Returns a policy based on sets- symbol and num sets', () => {
      const expectedPolicy = {
        policyRequirement: 'CHARACTER_SET',
        params: {
          sets: 'One number, one special character',
        },
      };
      // num and special characters are required, upper alpha are not
      const policy = wrapper.vm.getPoliciesFromCharacterSet([
        '0:ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '1:0123456789',
        "1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\"'\\`",
      ]);
      expect(policy).toStrictEqual(expectedPolicy);
    });

    it('Returns null if no required sets', () => {
      const policy = wrapper.vm.getPoliciesFromCharacterSet(['foo']);
      expect(policy).toBeNull();
    });
  });

  describe('Ensure policies for a resource are adjusted for inconsistencies in responses', () => {
    it('Successfully reads min length, dictionary and character set', async () => {
      configApi.getConfig = jest.fn().mockReturnValueOnce(Promise.resolve(minDictionaryChar));
      const getCharSetSpy = jest.spyOn(wrapper.vm, 'getPoliciesFromCharacterSet').mockReturnValue({
        policyRequirement: 'CHARACTER_SET',
        params: { sets: 'foo, bar' },
      });
      const policiesAfter = {
        data: [
          { policyRequirement: 'MIN_LENGTH', params: { minLength: 6 } },
          { policyRequirement: 'DICTIONARY' },
          { params: { sets: 'foo, bar' }, policyRequirement: 'CHARACTER_SET' },
        ],
        msg: 'Success',
      };
      const policies = await wrapper.vm.getDsPolicies('user');
      wrapper.vm.$nextTick();
      expect(getCharSetSpy).toHaveBeenCalled();
      expect(policies).toStrictEqual(policiesAfter);
    });

    it('Successfully reads length based and repeated characters', async () => {
      configApi.getConfig = jest.fn().mockReturnValueOnce(Promise.resolve(lengthRepeated));
      const getCharSetSpy = jest.spyOn(wrapper.vm, 'getPoliciesFromCharacterSet');

      const policiesAfter = {
        data: [
          { policyRequirement: 'LENGTH_BASED', params: { 'min-password-length': 6, 'max-password-length': 20 } },
          { policyRequirement: 'REPEATED_CHARACTERS', params: { 'max-consecutive-length': 2 } },
        ],
        msg: 'Success',
      };
      const policies = await wrapper.vm.getDsPolicies('user');
      wrapper.vm.$nextTick();
      expect(getCharSetSpy).not.toHaveBeenCalled();
      expect(policies).toStrictEqual(policiesAfter);
    });

    it('Returns empty array if no policy exists', async () => {
      configApi.getConfig = jest.fn().mockReturnValueOnce(Promise.reject());

      const policies = await wrapper.vm.getDsPolicies('user');
      wrapper.vm.$nextTick();
      expect(policies).toStrictEqual({ data: [], msg: 'Success' });
    });
  });

  describe('Ensure policies are normalized between IDM and DS responses', () => {
    it('Normalizes policies', () => {
      const getCharSetSpy = jest.spyOn(wrapper.vm, 'getPoliciesFromCharacterSet').mockReturnValue({
        policyRequirement: 'CHARACTER_SET',
        params: { sets: 'foo, bar' },
      });
      const policiesBefore = [
        { policyRequirement: 'REQUIRED' },
        { policyRequirement: 'ATTRIBUTE_VALUE', params: { 'match-attributes': ['sn', 'cn'] } },
        {
          policyRequirement: 'CHARACTER_SET',
          params: {
            'character-sets': [
              '1:0123456789',
              '1:ABCDEFGHIJKLMNOPQRSTUVWXYZ',
              '1:abcdefghijklmnopqrstuvwxyz',
              "1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\"'\\`",
            ],
          },
        },
        { policyRequirement: 'LENGTH_BASED', params: { 'max-password-length': 0, 'min-password-length': 6 } },
      ];
      const policiesAfter = [
        { policyRequirement: 'REQUIRED' },
        { policyRequirement: 'ATTRIBUTE_VALUE', params: { disallowedFields: 'Last Name, cn' } },
        { policyRequirement: 'CHARACTER_SET', params: { sets: 'foo, bar' } },
        { policyRequirement: 'MIN_LENGTH', params: { minLength: 6 } },
      ];
      const policies = wrapper.vm.normalizePolicies(policiesBefore);
      expect(getCharSetSpy).toHaveBeenCalled();
      expect(policies).toStrictEqual(policiesAfter);
    });
  });
});
