<script>
import _ from 'lodash';

/**
 * @description Resource management mixin used for generating an update patch and  handling policy errors
 *
 * */
export default {
  name: 'ResourceMixin',
  methods: {
    generateUpdatePatch(o, n) {
      const originalFrom = _.cloneDeep(o);
      const newForm = _.cloneDeep(n);

      let changes;

      if (_.isArray(newForm)) {
        changes = _.filter(newForm, (field, index) => {
          if (field.value !== originalFrom[index].value) {
            return true;
          }
          return false;
        });
      } else {
        changes = [];

        _.each(newForm, (value, key) => {
          if (originalFrom[key] !== newForm[key]) {
            changes.push({
              value: newForm[key],
              name: key,
            });
          }
        });
      }

      return _.map(changes, (formField) => {
        if (formField.value === '' || formField.value === null) {
          return { operation: 'remove', field: `/${formField.name}` };
        }
        return { operation: 'add', field: `/${formField.name}`, value: formField.value };
      });
    },

    findPolicyError(errorResponse, properties) {
      const error = [];

      if (_.has(errorResponse, 'data.detail.failedPolicyRequirements')) {
        _.each(errorResponse.data.detail.failedPolicyRequirements, (policy) => {
          if (policy.policyRequirements.length > 0) {
            let displayTitle = '';

            const foundProperty = _.find(properties, prop => prop.key === policy.property);
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
