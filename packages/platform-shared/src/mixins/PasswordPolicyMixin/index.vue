<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';

export default {
  name: 'PasswordPolicyMixin',
  data() {
    return {
      lowerSet: 'abcdefghijklmnopqrstuvwxyz',
      upperSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numberSet: '0123456789',
      symbolSet: '~!@#$%^&*()-_=+[]{}|;:,.<>/?"\'\\`',
    };
  },
  methods: {
    getPoliciesFromCharacterSet(sets) {
      const translatedSets = [];
      sets.forEach((set) => {
        if (set.includes(this.lowerSet) && set.charAt(0) !== '0') translatedSets.push(this.$t('common.policyValidationMessages.sets.lowercase'));
        if (set.includes(this.upperSet) && set.charAt(0) !== '0') translatedSets.push(this.$t('common.policyValidationMessages.sets.uppercase'));
        if (set.includes(this.numberSet) && set.charAt(0) !== '0') translatedSets.push(this.$t('common.policyValidationMessages.sets.number'));
        if (set.includes(this.symbolSet) && set.charAt(0) !== '0') translatedSets.push(this.$t('common.policyValidationMessages.sets.symbol'));
      });
      const policy = {
        policyRequirement: 'CHARACTER_SET',
        params: {},
      };
      // no sets means no set is required
      if (!translatedSets.length) return null;

      policy.params.sets = translatedSets.join(', ');
      return policy;
    },
    getValidatorIdForType(type) {
      return `${this.resourceName}PasswordPolicy-${type}-password-validator`;
    },
    getDsPolicies(resourceName) {
      return new Promise((resolve) => {
        const policies = [];
        getConfig(`fieldPolicy/${resourceName}`).then((res) => {
          const policy = res.data;
          if (policy && policy.validator) {
            policy.validator.forEach((validator) => {
              // eslint-disable-next-line no-underscore-dangle
              switch (validator._id) {
              case this.getValidatorIdForType('length-based'):
                if (validator.maxPasswordLength) {
                  policies.push({ name: 'LENGTH_BASED', params: { 'min-password-length': validator.minPasswordLength, 'max-password-length': validator.maxPasswordLength } });
                } else {
                  policies.push({ name: 'MIN_LENGTH', params: { minLength: validator.minPasswordLength } });
                }
                break;
              case this.getValidatorIdForType('repeated-characters'):
                policies.push({ name: 'REPEATED_CHARACTERS', params: { 'max-consecutive-length': validator.maxConsecutiveLength } });
                break;
              case this.getValidatorIdForType('dictionary'):
                policies.push({ name: 'DICTIONARY' });
                break;
              case this.getValidatorIdForType('character-set'):
                if (this.getPoliciesFromCharacterSet(validator.characterSet)) policies.push(this.getPoliciesFromCharacterSet(validator.characterSet));
                break;
              default:
                break;
              }
            });
          }
          resolve({ msg: 'Success', data: policies });
        }, () => {
          // return an empty array because when password policy does not exist, the get config endpoint returns an error
          resolve({ msg: 'Success', data: [] });
        });
      });
    },
    normalizePolicies(policies) {
      // remove character set policy where no character sets are required
      let normalizedPolicies = policies.filter((policy) => (!(policy.policyRequirement === 'CHARACTER_SET' && this.getPoliciesFromCharacterSet(policy.params['character-sets']) === null)));

      normalizedPolicies = policies.map((policy) => {
        switch (policy.policyRequirement) {
        case 'LENGTH_BASED':
          if (policy.params['max-password-length'] === 0) {
            return {
              policyRequirement: 'MIN_LENGTH',
              params: { minLength: policy.params['min-password-length'] },
            };
          }
          return policy;
        case 'CHARACTER_SET':
          return this.getPoliciesFromCharacterSet(policy.params['character-sets']);
        case 'ATTRIBUTE_VALUE':
          return {
            policyRequirement: 'ATTRIBUTE_VALUE',
            params: { disallowedFields: policy.params['match-attributes'].join(', ') },
          };
        default:
          return policy;
        }
      });
      return normalizedPolicies;
    },
  },
};
</script>
