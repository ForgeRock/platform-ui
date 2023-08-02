<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'PasswordPolicyMixin',
  mixins: [
    TranslationMixin,
  ],
  data() {
    return {
      lowerSet: 'abcdefghijklmnopqrstuvwxyz',
      upperSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numberSet: '0123456789',
      symbolSet: '~!@#$%^&*()-_=+[]{}|;:,.<>/?"\'\\`',
    };
  },
  methods: {
    getSetTranslations(sets) {
      const translatedSets = [];
      sets.forEach((set) => {
        if (set.includes(this.lowerSet)) translatedSets.push(this.$t('common.policyValidationMessages.sets.lowercase'));
        if (set.includes(this.upperSet)) translatedSets.push(this.$t('common.policyValidationMessages.sets.uppercase'));
        if (set.includes(this.numberSet)) translatedSets.push(this.$t('common.policyValidationMessages.sets.number'));
        if (set.includes(this.symbolSet)) translatedSets.push(this.$t('common.policyValidationMessages.sets.symbol'));
      });

      // force the ordering of the sets
      const order = [
        this.$t('common.policyValidationMessages.sets.lowercase'),
        this.$t('common.policyValidationMessages.sets.uppercase'),
        this.$t('common.policyValidationMessages.sets.number'),
        this.$t('common.policyValidationMessages.sets.symbol'),
      ];
      translatedSets.sort((a, b) => (order.indexOf(a) - order.indexOf(b)));
      if (translatedSets.length) translatedSets[0] = translatedSets[0].charAt(0).toUpperCase() + translatedSets[0].slice(1);

      return translatedSets;
    },
    getMinCharacterSetPolicy(sets, minSets) {
      if (!sets.length) return null;

      const translatedSets = this.getSetTranslations(sets);

      // when all of the sets are required, need a different policy message
      if (sets.length === minSets) {
        return {
          policyRequirement: 'CHARACTER_SET',
          params: {
            sets: translatedSets.join(', '),
          },
        };
      }

      return {
        policyRequirement: 'MIN_CHARACTER_SETS',
        params: {
          sets: translatedSets.join(', '),
          minSets,
        },
      };
    },
    getCharacterSetPolicy(sets) {
      // if a set starts with 0, it is not required, so it doesn't need to be included
      // required sets start with 1. (ex: 1:abc... vs 0:abc...)
      const translatedSets = this.getSetTranslations(sets.filter((set) => set.charAt(0) !== '0'));

      if (!translatedSets.length) return null;

      return {
        policyRequirement: 'CHARACTER_SET',
        params: {
          sets: translatedSets.join(', '),
        },
      };
    },
    getPoliciesFromCharacterSet(sets, minSets) {
      if (minSets) {
        return this.getMinCharacterSetPolicy(sets, minSets);
      }
      return this.getCharacterSetPolicy(sets);
    },
    getValidatorIdForType(resourceName, type) {
      return `${resourceName}PasswordPolicy-${type}-password-validator`;
    },
    /**
     * Gets policies based on resource type, and adjusts the response to work for
     * IDM and DS- the responses are inconsistent and require small tweaks
     *
     * @param {String} resourceName name of resource to retrieve policies for
     * @returns {Object} object with success message and the policies
     */
    getDsPolicies(resourceName) {
      return new Promise((resolve) => {
        const policies = [];
        getConfig(`fieldPolicy/${resourceName}`).then((res) => {
          const policy = res.data;
          if (policy && policy.validator) {
            policy.validator.forEach((validator) => {
              switch (validator._id) {
                case this.getValidatorIdForType(resourceName, 'length-based'):
                  if (validator.maxPasswordLength) {
                    policies.push({ policyRequirement: 'LENGTH_BASED', params: { 'min-password-length': validator.minPasswordLength, 'max-password-length': validator.maxPasswordLength } });
                  } else {
                    policies.push({ policyRequirement: 'MIN_LENGTH', params: { minLength: validator.minPasswordLength } });
                  }
                  break;
                case this.getValidatorIdForType(resourceName, 'repeated-characters'):
                  policies.push({ policyRequirement: 'REPEATED_CHARACTERS', params: { 'max-consecutive-length': validator.maxConsecutiveLength } });
                  break;
                case this.getValidatorIdForType(resourceName, 'dictionary'):
                  policies.push({ policyRequirement: 'DICTIONARY' });
                  break;
                case this.getValidatorIdForType(resourceName, 'character-set'):
                  if (this.getPoliciesFromCharacterSet(validator.characterSet, validator.minCharacterSets)) {
                    policies.push(this.getPoliciesFromCharacterSet(validator.characterSet, validator.minCharacterSets));
                  }
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
    /**
     *
     * IDM and DS policies are returned in slightly different formats-
     * we need to normalize the different responses to be consistent
     *
     * @param {Object} policies object containing all required policies
     * @returns {Object} object with adjusted policies
     */
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
            if (policy.params['character-sets']) {
              return this.getPoliciesFromCharacterSet(policy.params['character-sets'], policy.params['min-character-sets']);
            }
            return policy;
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
