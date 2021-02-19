<!-- Copyright 2019-2021 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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

/**
 * @description Resource management mixin used for generating an update patch and handling policy errors
 */
export default {
  name: 'ResourceMixin',
  methods: {
    generateUpdatePatch(original, newForm) {
      const clonedOriginal = cloneDeep(original);
      const clonedNew = cloneDeep(newForm);

      let changes;

      if (isArray(clonedNew)) {
        changes = filter(clonedNew, (field, index) => {
          if (field.value !== clonedOriginal[index].value) {
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
        if (formField.value === '' || formField.value === null) {
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
            let displayTitle = '';

            const foundProperty = find(properties, (prop) => prop.key === policy.property);
            const params = policy.policyRequirements[0].params || {};

            if (foundProperty) {
              if (foundProperty.title) {
                displayTitle = foundProperty.title;
              } else {
                displayTitle = foundProperty.key;
              }

              params.property = displayTitle;
            }

            error.push({
              exists: displayTitle.length > 0,
              field: policy.property,
              msg: this.$t(`common.policyValidationMessages.${policy.policyRequirements[0].policyRequirement}`, params),
            });
          }
        });
      }

      // repo level password policy has a different response and only corresponds to the 'password' field.
      if (has(errorResponse, 'data.message')) {
        if (errorResponse.data.code === 400 && errorResponse.data.message.includes('Constraint Violation')) {
          const re = /:.*:\s(.*)/;
          const msg = re.exec(errorResponse.data.message)[1];
          // decode html entities
          const textArea = document.createElement('textarea');
          textArea.innerHTML = msg;

          error.push({
            exists: true,
            field: 'password',
            msg: textArea.value,
          });
        }
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
        each(displayFields, (field, index) => {
          let type = 'string';

          if (!isUndefined(schemaProps) && !isUndefined(schemaProps[field])) {
            // eslint-disable-next-line prefer-destructuring
            type = schemaProps[field].type;
          }

          if (type === 'number' && !isNaN(toNumber(filterString))) {
            // Search based on number and proper number value
            if ((index + 1) < displayFields.length) {
              filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
            } else {
              filterUrl = `${filterUrl}${field} eq ${filterString}`;
            }
          } else if (type === 'boolean' && (filterString === 'true' || filterString === 'false')) {
            // Search based on boolean and proper boolean true/false
            if ((index + 1) < displayFields.length) {
              filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
            } else {
              filterUrl = `${filterUrl}${field} eq ${filterString}`;
            }
          } else if ((index + 1) < displayFields.length) {
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
  },
};
</script>
