<!-- Copyright (c) 2019-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
/* eslint-disable no-restricted-syntax */
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
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';
import { getManagedResourceCount } from '@forgerock/platform-shared/src/api/ManagedResourceApi';

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
    findChanges(clonedNew, clonedOriginal) {
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
      return changes;
    },
    generateUpdatePatch(original, newForm) {
      const clonedOriginal = cloneDeep(original);
      const clonedNew = cloneDeep(newForm);
      const changes = this.findChanges(clonedNew, clonedOriginal);

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

            const foundProperty = find(properties, (prop) => prop.name === policy.property || prop.propName === policy.property);
            const params = policyRequirements[0].params || {};

            if (foundProperty) {
              if (foundProperty.title) {
                displayTitle = foundProperty.title;
              } else {
                displayTitle = foundProperty.name || foundProperty.propName;
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
    /**
     * Gets the minimumUIFilterLength setting from uiConfig and if no setting exists there does a _countOnly query
     * on the specified managed object then if the number of records exceeds 1000 the minimumUIFilterLength is set to 3
     * else it is set to 0.
     *
     * @param {string} managedObjectName - Required name of managed object to get minimumUIFilterLength for
     * @returns {number} number representing minimumUIFilterLength
     */
    async getMinimumUIFilterLength(managedObjectName) {
      const defaultMinimumUIFilterLength = 3;
      const numRecordsForIntervention = 1000;
      const { uiConfig, managedObjectMinimumUIFilterLength } = this.$store.state.SharedStore;
      const userStore = useUserStore();
      let minimumUIFilterLength = 0;
      // check the SharedStore first to see if the minimumUIFilterLength value has already been set for this managed object
      if (uiConfig && has(uiConfig.configuration?.platformSettings?.managedObjectsSettings, `${managedObjectName}.minimumUIFilterLength`)) {
        // the setting exists in uiConfig so it takes precedence
        minimumUIFilterLength = uiConfig.configuration.platformSettings.managedObjectsSettings[managedObjectName].minimumUIFilterLength;
      } else if (has(managedObjectMinimumUIFilterLength, managedObjectName)) {
        // the setting has already been calculated by getting a count on the object's dataset
        minimumUIFilterLength = managedObjectMinimumUIFilterLength[managedObjectName];
      } else if (managedObjectName === 'internalrole') {
        // special case for internalrole if an override is not already set in uiConfig.configuration?.platformSettings?.managedObjectsSettings
        // set it to zero
        minimumUIFilterLength = 0;
      } else if (userStore.adminUser) {
        try {
          // this user has openidm-admin role so they are allowed to get the count of the whole managed object's dataset
          const result = await getManagedResourceCount(managedObjectName);
          // based on resultCount set a value in SharedStore.managedObjectMinimumUIFilterLength for this managed object
          // this will keep the number of calls to getManagedResourceCount() to a minimum
          if (result?.data.resultCount > numRecordsForIntervention) {
            // the object meets the criteria for intervention
            // set it to defaultMinimumUIFilterLength
            this.$store.commit('SharedStore/setManagedObjectMinimumUIFilterLength', { managedObjectName, val: defaultMinimumUIFilterLength });
            minimumUIFilterLength = defaultMinimumUIFilterLength;
          } else {
            // the object does not have enough records to cause a performance degredation
            // set it to zero
            this.$store.commit('SharedStore/setManagedObjectMinimumUIFilterLength', { managedObjectName, val: 0 });
            minimumUIFilterLength = 0;
          }
        } catch (error) {
          // Unable to retrieve a count for the object, fall back to the default value
          this.$store.commit('SharedStore/setManagedObjectMinimumUIFilterLength', { managedObjectName, val: defaultMinimumUIFilterLength });
          minimumUIFilterLength = defaultMinimumUIFilterLength;
        }
      } else {
        // this is a delegated admin user who does not have access to the getManagedResourceCount request above and there is no uiConfig setting
        // set to defaultMinimumUIFilterLength as a catch all
        minimumUIFilterLength = defaultMinimumUIFilterLength;
      }

      return minimumUIFilterLength;
    },
    /**
     * Gets minimumUIFilterLength setting for each manage object
     *
     * @param {array} managedObjects - Required array of managed object schemas
     * @returns {object} an object with a property with the name of the managed object who's value is minimumUIFilterLength for said object
     */
    async getAllMinimumUIFilterLengthSettings(managedObjects) {
      const minimumUIFilterLengthSettings = {};
      for await (const managedObject of managedObjects) {
        minimumUIFilterLengthSettings[managedObject.name] = await this.getMinimumUIFilterLength(managedObject.name);
      }
      return minimumUIFilterLengthSettings;
    },
  },
};
</script>
