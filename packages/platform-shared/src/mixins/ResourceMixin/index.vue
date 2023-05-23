<!-- Copyright (c) 2019-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
  cloneDeep,
  each,
  filter,
  find,
  has,
  isNaN,
  isArray,
  map,
  isEqual,
  isUndefined,
  toNumber,
} from 'lodash';
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';

/**
 * @description Resource management mixin used for generating an update patch and handling policy errors
 */
export default {
  name: 'ResourceMixin',
  mixins: [PasswordPolicyMixin],
  data() {
    return {
      searchHelpText: '',
      submitBeforeLengthValid: false,
      hasFocus: false,
    };
  },
  methods: {
    generateUpdatePatch(original, newForm) {
      const clonedOriginal = cloneDeep(original);
      const clonedNew = cloneDeep(newForm);

      let changes;

      if (isArray(clonedNew)) {
        changes = filter(clonedNew, (field, index) => {
          if (isArray(field.value)) {
            if (JSON.stringify(field.value) !== JSON.stringify(clonedOriginal[index].value)) {
              return true;
            }
          } else if (field.value !== clonedOriginal[index].value) {
            return true;
          }
          return false;
        });
      } else {
        changes = [];

        each(clonedNew, (value, key) => {
          if (!isEqual(clonedOriginal[key], clonedNew[key])) {
            changes.push({
              value: clonedNew[key],
              name: key,
            });
          }
        });
      }

      return map(changes, (formField) => {
        if (formField.value === '' || formField.value === null || formField.value === undefined) {
          return { operation: 'remove', field: `/${formField.name}` };
        }
        if (clonedOriginal[formField.name] === '' || clonedOriginal[formField.name] === null) {
          return { operation: 'add', field: `/${formField.name}`, value: formField.value };
        }
        return { operation: 'replace', field: `/${formField.name}`, value: formField.value };
      });
    },

    findPolicyError(errorResponse, properties) {
      const error = [];

      if (has(errorResponse, 'data.detail.failedPolicyRequirements')) {
        each(errorResponse.data.detail.failedPolicyRequirements, (policy) => {
          if (policy.policyRequirements.length > 0) {
            const policyRequirements = this.normalizePolicies(policy.policyRequirements);
            let displayTitle = '';

            const foundProperty = find(properties, (prop) => prop.name === policy.property);
            const params = policyRequirements[0].params || {};

            if (foundProperty) {
              if (foundProperty.title) {
                displayTitle = foundProperty.title;
              } else {
                displayTitle = foundProperty.name;
              }

              params.property = displayTitle;
            }

            error.push({
              exists: displayTitle.length > 0,
              field: policy.property,
              msg: this.$t(`common.policyValidationMessages.${policyRequirements[0].policyRequirement}`, params),
            });
          }
        });
      }

      return error;
    },
    /**
     * Builds API URL using value in search box
     *
     * @param {string} filterString - Required current value of search box
     * @param {array} displayFields - Required array of field names that we want to query on
     * @param {object} schemaProps - Required metadata of current schema
     */
    generateSearch(filterString, displayFields, schemaProps) {
      let filterUrl = '';

      if (filterString.length > 0) {
        // remove nested properties
        const filteredFields = displayFields.filter((field) => (!field.includes('/')));

        each(filteredFields, (field, index) => {
          let type = 'string';

          if (!isUndefined(schemaProps) && !isUndefined(schemaProps[field])) {
            // eslint-disable-next-line prefer-destructuring
            type = schemaProps[field].type;
          }

          if (type === 'number' && !isNaN(toNumber(filterString))) {
            // Search based on number and proper number value
            if ((index + 1) < filteredFields.length) {
              filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
            } else {
              filterUrl = `${filterUrl}${field} eq ${filterString}`;
            }
          } else if (type === 'boolean' && (filterString === 'true' || filterString === 'false')) {
            // Search based on boolean and proper boolean true/false
            if ((index + 1) < filteredFields.length) {
              filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
            } else {
              filterUrl = `${filterUrl}${field} eq ${filterString}`;
            }
          } else if ((index + 1) < filteredFields.length) {
            // Fallback to general string search if all other criteria fails
            // IAM-1003 revealed an issue with some url encoding differences between
            // chrome and IE. Need to use %22 instead of " to avoid the encoding
            filterUrl = `${filterUrl}${field} sw "${filterString}" OR `;
          } else {
            filterUrl = `${filterUrl}${field} sw "${filterString}"`;
          }
        });
      } else {
        filterUrl = 'true';
      }

      return filterUrl;
    },
    /**
     * Change help text based on query threshold value and the current search text length
     */
    setHelpTextFromSearchLength() {
      this.hasFocus = true;

      if (!this.queryThreshold && this.filter.length === 0) {
        this.searchHelpText = '';
      } else if (this.filter.length < this.queryThreshold) {
        this.searchHelpText = this.$t('listResource.searchInProgressText', { queryThreshold: this.queryThreshold });
      } else {
        this.searchHelpText = this.$t('listResource.searchActiveText');
      }

      if (this.filter.length === 0) {
        this.submitBeforeLengthValid = false;
      } else if (this.filter.length >= this.queryThreshold) {
        this.submitBeforeLengthValid = false;
      }
    },
    removeHelpText() {
      this.hasFocus = false;
      this.searchHelpText = '';
    },
  },
};
</script>
