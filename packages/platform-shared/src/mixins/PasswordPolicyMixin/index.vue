<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
    getValidatorIdForType(type) {
      return `${this.resourceName}PasswordPolicy-${type}-password-validator`;
    },
    getPolicies(resourceName) {
      return new Promise((resolve) => {
        const policies = [];
        getConfig(`fieldPolicy/${resourceName}`).then((res) => {
          const policy = res.data;
          if (policy) {
            if (policy.passwordHistoryCount > 0) {
              policies.push({ name: 'IS_NEW', params: { historyLength: policy.passwordHistoryCount } });
            }
            if (policy.validator) {
              policy.validator.forEach((validator) => {
                // eslint-disable-next-line no-underscore-dangle
                switch (validator._id) {
                case this.getValidatorIdForType('length-based'):
                  policies.push({ name: 'MIN_LENGTH', params: { minLength: validator.minPasswordLength } });
                  policies.push({ name: 'MAX_LENGTH', params: { maxLength: validator.maxPasswordLength } });
                  break;
                case this.getValidatorIdForType('repeated-characters'):
                  policies.push({ name: 'NO_REPEAT', params: { numRepeat: validator.maxConsecutiveLength } });
                  break;
                case this.getValidatorIdForType('dictionary'):
                  policies.push({ name: 'DICTIONARY' });
                  break;
                case this.getValidatorIdForType('attribute-value'):
                  policies.push({ name: 'CANNOT_CONTAIN_OTHERS', params: { disallowedFields: validator.matchAttribute } });
                  break;
                case this.getValidatorIdForType('character-set'):
                  validator.characterSet.forEach((set) => {
                    if (set.includes(this.lowerSet) && set.charAt(0) !== '0') policies.push({ name: 'AT_LEAST_X_LOWER_LETTERS', params: { numLower: set.charAt(0) } });
                    if (set.includes(this.upperSet) && set.charAt(0) !== '0') policies.push({ name: 'AT_LEAST_X_CAPITAL_LETTERS', params: { numCaps: set.charAt(0) } });
                    if (set.includes(this.numberSet) && set.charAt(0) !== '0') policies.push({ name: 'AT_LEAST_X_NUMBERS', params: { numNums: set.charAt(0) } });
                    if (set.includes(this.symbolSet) && set.charAt(0) !== '0') policies.push({ name: 'AT_LEAST_X_SYMBOLS', params: { numSyms: set.charAt(0) } });
                  });
                  break;
                default:
                  break;
                }
              });
            }
          }
          resolve({ msg: 'Success', data: policies });
        }, () => {
          // return an empty array because when password policy does not exist, the get config endpoint returns an error
          resolve({ msg: 'Success', data: [] });
        });
      });
    },
  },
};
</script>
