<script>
import {
  cloneDeep, each, filter, find, has, isArray, map,
} from 'lodash';

/**
 * @description Resource management mixin used for generating an update patch and  handling policy errors
 *
 * */
export default {
  name: 'ResourceMixin',
  methods: {
    generateUpdatePatch(o, n) {
      const originalFrom = cloneDeep(o);
      const newForm = cloneDeep(n);

      let changes;

      if (isArray(newForm)) {
        changes = filter(newForm, (field, index) => {
          if (field.value !== originalFrom[index].value) {
            return true;
          }
          return false;
        });
      } else {
        changes = [];

        each(newForm, (value, key) => {
          if (originalFrom[key] !== newForm[key]) {
            changes.push({
              value: newForm[key],
              name: key,
            });
          }
        });
      }

      return map(changes, (formField) => {
        if (formField.value === '' || formField.value === null) {
          return { operation: 'remove', field: `/${formField.name}` };
        }
        return { operation: 'add', field: `/${formField.name}`, value: formField.value };
      });
    },

    findPolicyError(errorResponse, properties) {
      const error = [];

      if (has(errorResponse, 'data.detail.failedPolicyRequirements')) {
        each(errorResponse.data.detail.failedPolicyRequirements, (policy) => {
          if (policy.policyRequirements.length > 0) {
            let displayTitle = '';

            const foundProperty = find(properties, prop => prop.key === policy.property);
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
