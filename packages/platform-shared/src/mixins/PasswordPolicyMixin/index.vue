<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { doesValueContainPlaceholder, getEsvValue } from '@forgerock/platform-shared/src/utils/esvUtils';
import i18n from '@/i18n';

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
        if (set.includes(this.lowerSet)) translatedSets.push(i18n.global.t('common.policyValidationMessages.sets.lowercase'));
        if (set.includes(this.upperSet)) translatedSets.push(i18n.global.t('common.policyValidationMessages.sets.uppercase'));
        if (set.includes(this.numberSet)) translatedSets.push(i18n.global.t('common.policyValidationMessages.sets.number'));
        if (set.includes(this.symbolSet)) translatedSets.push(i18n.global.t('common.policyValidationMessages.sets.symbol'));
      });

      // force the ordering of the sets
      const order = [
        i18n.global.t('common.policyValidationMessages.sets.lowercase'),
        i18n.global.t('common.policyValidationMessages.sets.uppercase'),
        i18n.global.t('common.policyValidationMessages.sets.number'),
        i18n.global.t('common.policyValidationMessages.sets.symbol'),
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
    async getDsPolicies(resourceName) {
      const policies = [];
      let res;
      try {
        res = await getConfig(`fieldPolicy/${resourceName}`);
      } catch {
        // return an empty array because when password policy does not exist, the get config endpoint returns an error
        return { msg: 'Success', data: [] };
      }

      const policy = res.data;
      if (policy && policy.validator) {
        const isFraas = this.$store?.state?.isFraas;

        /**
         * Resolves an ESV placeholder value when on a FRaaS environment.
         * Returns the resolved value, or the original if resolution fails or is empty.
         * @param {String|Object} value the field value to potentially resolve
         * @returns {Promise<String|Object>} the resolved value or the original
         */
        const resolveIfPlaceholder = (value) => {
          if (isFraas && doesValueContainPlaceholder(value)) {
            return getEsvValue(value, true).then((resolved) => resolved || value);
          }
          return Promise.resolve(value);
        };

        /**
         * Builds a policy entry for a single validator, resolving any ESV placeholders.
         * @param {Object} validator the validator object from the policy response
         * @returns {Promise<Object|null>} the resolved policy entry or null to skip
         */
        const buildPolicyForValidator = (validator) => {
          switch (validator._id) {
            case this.getValidatorIdForType(resourceName, 'length-based'):
              return Promise.all([
                resolveIfPlaceholder(validator.minPasswordLength),
                resolveIfPlaceholder(validator.maxPasswordLength),
              ]).then(([minPasswordLength, maxPasswordLength]) => {
                if (validator.maxPasswordLength && String(maxPasswordLength) !== '0') {
                  return { policyRequirement: 'LENGTH_BASED', params: { 'min-password-length': minPasswordLength, 'max-password-length': maxPasswordLength } };
                }
                return { policyRequirement: 'MIN_LENGTH', params: { minLength: minPasswordLength } };
              });
            case this.getValidatorIdForType(resourceName, 'repeated-characters'):
              return resolveIfPlaceholder(validator.maxConsecutiveLength).then((maxConsecutiveLength) => ({ policyRequirement: 'REPEATED_CHARACTERS', params: { 'max-consecutive-length': maxConsecutiveLength } }));
            case this.getValidatorIdForType(resourceName, 'dictionary'):
              return Promise.resolve({ policyRequirement: 'DICTIONARY' });
            case this.getValidatorIdForType(resourceName, 'character-set'):
              return Promise.resolve(this.getPoliciesFromCharacterSet(validator.characterSet, validator.minCharacterSets) || null);
            case this.getValidatorIdForType(resourceName, 'attribute-value'):
              return Promise.resolve({
                policyRequirement: 'ATTRIBUTE_VALUE',
                params: {
                  disallowedFields: validator.matchAttribute.map((attribute) => {
                    if (this.translationExists(`common.policyValidationMessages.attributes.${attribute}`)) {
                      return i18n.global.t(`common.policyValidationMessages.attributes.${attribute}`);
                    }
                    return attribute;
                  }).join(', '),
                },
              });
            default:
              return Promise.resolve(null);
          }
        };

        const results = await Promise.all(policy.validator.map(buildPolicyForValidator));
        results.forEach((entry) => {
          if (entry) policies.push(entry);
        });
      }
      return { msg: 'Success', data: policies };
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
            if (Array.isArray(policy.params['match-attributes'])) {
              policy.params['match-attributes'].forEach((attribute) => {
              // translate attribute names if possible
                if (this.translationExists(`common.policyValidationMessages.attributes.${attribute}`)) {
                  attributes.push(i18n.global.t(`common.policyValidationMessages.attributes.${attribute}`));
                } else {
                  attributes.push(attribute);
                }
              });
            }
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
