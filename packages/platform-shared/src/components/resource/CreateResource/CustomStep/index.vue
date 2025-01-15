<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div :class="['text-muted', { 'p-4' : property.key !== 'privileges' }]">
    <template v-if="showToggle">
      <div class="mb-4">
        {{ descriptionText }}
      </div>
      <FrField
        :value="showForm"
        type="boolean"
        :label="property.description"
        @input="toggleForm" />
    </template>
    <div
      v-if="showForm"
      class="mt-4">
      <div v-if="property.isConditional">
        <FrQueryFilterBuilder
          v-if="property.isConditional"
          @change="queryFilterChange"
          :query-filter-string="queryFilterField.value"
          :resource-name="conditionResource"
          :properties="conditionOptions" />
      </div>
      <FrTimeConstraint
        v-if="property.isTemporalConstraint"
        v-model="temporalconstraint" />
      <FrAddPrivileges
        v-if="property.key === 'privileges' && !loading"
        :privileges-field="property"
        :schema-map="schemaMap"
        :loading="loading"
        @new-privileges-modified="newPrivileges = $event" />
    </div>
  </div>
</template>

<script>import {
  has,
  isEmpty,
} from 'lodash';
import axios from 'axios';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrTimeConstraint from '@forgerock/platform-shared/src/components/TimeConstraint';
import FrAddPrivileges from '@forgerock/platform-shared/src/components/resource/EditResource/CustomTabs/PrivilegesTab/AddPrivileges';
import FrQueryFilterBuilder from '@forgerock/platform-shared/src/components/filterBuilder/QueryFilterBuilder';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

export default {
  name: 'CustomStep',
  components: {
    FrAddPrivileges,
    FrField,
    FrTimeConstraint,
    FrQueryFilterBuilder,
  },
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  props: {
    property: {
      type: Object,
      default: () => {},
    },
    resourceName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showForm: false,
      showToggle: true,
      queryFilterField: {
        type: 'text',
        title: 'Query Filter =>',
        value: '',
      },
      temporalconstraint: '',
      newPrivileges: [],
      schemaMap: {},
      loading: true,
      conditionOptions: [],
      conditionResource: 'user',
    };
  },
  computed: {
    descriptionText() {
      if (this.property.isConditional) {
        return this.$t('pages.access.conditionDescription', { resourceName: this.resourceName });
      }

      return this.$t('pages.access.temporalConstraintDescription');
    },
  },
  watch: {
    temporalconstraint(newVal) {
      this.emitValue([{
        duration: newVal,
      }]);
    },
    newPrivileges(newVal) {
      const updatedPrivileges = newVal.map((privilege) => {
        const updatedPrivilege = { ...privilege };
        // IAM-8048 - _id should be included with readOnly set to true for all privileges
        const hasIdProperty = Object.keys(this.schemaMap[updatedPrivilege.path]?.properties || {}).includes('_id');
        const hasIdPermission = updatedPrivilege.accessFlags && (updatedPrivilege.accessFlags.findIndex((accessFlag) => accessFlag.attribute === '_id') !== -1);
        if (hasIdProperty && !hasIdPermission) {
          updatedPrivilege.accessFlags = [...updatedPrivilege.accessFlags, { attribute: '_id', readOnly: true }];
        }
        if (updatedPrivilege.filter === '') {
          delete updatedPrivilege.filter;
        }
        return updatedPrivilege;
      });
      this.emitValue(updatedPrivileges);
    },
  },
  methods: {
    /**
    * Handles change to QueryFilterBuilder value
    *
    * @property {string} queryFilterString
    */
    queryFilterChange(queryFilterString) {
      this.queryFilterField.value = queryFilterString;
      this.emitValue(queryFilterString);
    },
    /**
    * Opens/Closes either the QueryFilterBuilder or the TimeConstraint compoent
    */
    toggleForm(showForm) {
      this.showForm = showForm;
      // If the toggle is off set the property value to null
      if (!this.showForm) {
        this.queryFilterField.value = '';
        this.$emit('input', this.property.key, null);
      }
    },
    /**
    * Emits component's value
    *
    * @property {string} val - input value
    */
    emitValue(val) {
      this.$emit('input', this.property.key, val);
    },
    /**
    * Gets schema for objects available for setting privileges on
    */
    setPrivilegesStep() {
      this.showForm = true;
      this.showToggle = false;
      const urlParams = {
        queryFilter: 'resourceCollection eq "internal/role" or (resourceCollection sw "managed")',
        fields: '*',
      };

      const userStore = useUserStore();
      // get schema for all internal/role and all managed objects that are not
      // managed/assignment or that end in application
      if (userStore.adminUser) {
        getSchema(encodeQueryString(urlParams)).then(
          (response) => {
            const schemas = response.data.result.filter((result) => {
              const resourceName = result.resourceCollection;

              // Always filter objects ending in managed/assignment, and when workforce
              // is enabled also filter out reserved resources
              const { workforceEnabled } = this.$store.state.SharedStore;
              const reservedAlways = this.$store.state.isFraas ? ['managed/alpha_assignment', 'managed/bravo_assignment'] : ['managed/assignment'];
              const reservedWhenWorkforceEnabled = this.$store.state.isFraas ? ['managed/alpha_application', 'managed/bravo_application'] : ['managed/application'];
              const rejectedAlways = reservedAlways.includes(resourceName);
              const rejectedWhenWorkforceEnabled = workforceEnabled && reservedWhenWorkforceEnabled.includes(resourceName);

              return !rejectedAlways && !rejectedWhenWorkforceEnabled;
            });

            schemas.forEach((schema) => {
              // filter out schemas with no properties
              if (has(schema, 'properties') && !isEmpty(schema.properties)) {
                this.schemaMap[schema._id] = schema;
              }
            });

            this.loading = false;
          },
          () => {
            this.showErrorMessage('error', this.$t('pages.access.errorGettingSchema'));
          },
        );
      } else {
        // get privileges, then construct get with the resources they have access to, one at a time
        const idmInstance = this.getRequestService();
        idmInstance.post('privilege?_action=listPrivileges').then(
          (response) => {
            const axiosCalls = response.data.map((privilege) => getSchema(privilege.privilegePath));

            axios.all(axiosCalls).then(axios.spread((...privilegesArray) => {
              privilegesArray.forEach((privilegeObj) => {
                this.schemaMap[privilegeObj.data.resourceCollection] = privilegeObj.data;
              });

              this.loading = false;
            }));
          },
        ).catch(() => {
          this.showErrorMessage('error', this.$t('pages.access.errorGettingSchema'));
        });
      }
    },
    /**
    * Gets schema for user which is needed to define properties availble in QueryFilterBuilder.
    */
    setConditionOptions() {
      // TODO: replace hard coded "managed/user" with "conditionObject" schema property value
      let conditionObject = 'managed/user';
      this.conditionOptions = [];

      if (this.$store.state.isFraas) {
        conditionObject = `managed/${this.$store.state.realm}_user`;
        this.conditionResource = `${this.$store.state.realm}_user`;
      }

      getSchema(conditionObject).then((schema) => {
        const filteredProperties = [];

        schema.data.order.forEach((key) => {
          const property = schema.data.properties[key];
          if (key !== '_id' && property.type !== 'array' && property.type !== 'relationship' && property.viewable) {
            property.propName = key;
            filteredProperties.push(property);
          }
        });

        filteredProperties.forEach((property) => {
          if (property.type === 'object') {
            property.order.forEach((subProp) => {
              this.conditionOptions.push({
                label: `${property.title}/${subProp}`,
                value: `${property.propName}/${subProp}`,
                type: property.properties[subProp].type,
              });
            });
          } else {
            this.conditionOptions.push({
              label: property.title,
              value: property.propName,
              type: property.type,
            });
          }
        });
      },
      () => {
        this.showErrorMessage('error', this.$t('pages.access.invalidEdit'));
      });
    },
  },
  mounted() {
    if (this.property.key === 'privileges') {
      this.setPrivilegesStep();
    }

    if (this.property.isConditional) {
      this.setConditionOptions();
    }
  },
};
</script>
