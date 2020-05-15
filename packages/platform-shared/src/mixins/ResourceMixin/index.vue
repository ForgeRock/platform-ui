<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

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
  isArray,
  map,
  isEqual,
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

      return error;
    },
  },
};
</script>
