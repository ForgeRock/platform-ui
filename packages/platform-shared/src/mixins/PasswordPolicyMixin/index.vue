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
              switch (validator._id) {
                case this.getValidatorIdForType('length-based'):
                  if (validator.maxPasswordLength) {
                    policies.push({ policyRequirement: 'LENGTH_BASED', params: { 'min-password-length': validator.minPasswordLength, 'max-password-length': validator.maxPasswordLength } });
                  } else {
                    policies.push({ policyRequirement: 'MIN_LENGTH', params: { minLength: validator.minPasswordLength } });
                  }
                  break;
                case this.getValidatorIdForType('repeated-characters'):
                  policies.push({ policyRequirement: 'REPEATED_CHARACTERS', params: { 'max-consecutive-length': validator.maxConsecutiveLength } });
                  break;
                case this.getValidatorIdForType('dictionary'):
                  policies.push({ policyRequirement: 'DICTIONARY' });
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
      const normalizedPolicies = policies.map((policy) => {
        const attributes = [];
        switch (policy.policyRequirement) {
          case 'LENGTH_BASED':
            // use min length policy if max is 0
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
            policy.params['match-attributes'].forEach((attribute) => {
              // translate attribute names if possible
              if (this.translationExists(`common.policyValidationMessages.attributes.${attribute}`)) {
                attributes.push(this.$t(`common.policyValidationMessages.attributes.${attribute}`));
              } else {
                attributes.push(attribute);
              }
            });
            return {
              policyRequirement: 'ATTRIBUTE_VALUE',
              params: { disallowedFields: attributes.join(', ') },
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
