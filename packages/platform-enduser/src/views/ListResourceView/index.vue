<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <div class="mt-5">
      <FrHeader
        :title="displayName"
        :subtitle="$t('pages.identities.subTitle')" />
      <BCard
        no-body
        class="card-tabs-vertical">
        <FrListResource
          v-if="routerParameters"
          :delete-managed-resource="deleteManagedResource"
          :delete-internal-resource="deleteInternalResource"
          :router-parameters="routerParameters"
          :table-data="tableData"
          :last-page="lastPage"
          :edit-access="hasUpdateAccess"
          :delete-access="hasDeleteAccess"
          @get-table-data="getTableData"
          @row-clicked="resourceClicked">
          <template #listToolbar>
            <BButton
              v-if="createProperties"
              v-b-modal.createResourceModal
              type="button"
              variant="primary">
              <i
                class="material-icons-outlined mr-2"
                aria-hidden="true">
                add
              </i>
              {{ $t("common.newObject", {object: displayName}) }}
            </BButton>
          </template>
        </FrListResource>
        <FrCreateResource
          v-if="routerParameters && createProperties"
          @refreshGrid="getTableData(currentTableParams)"
          :resource-title="displayName"
          :resource-name="routerParameters.resourceName"
          :resource-type="routerParameters.resourceType"
          :create-properties="createProperties" />
      </BCard>
    </div>
  </BContainer>
</template>
<script>

import axios from 'axios';
import {
  BCard,
  BContainer,
  VBModal,
} from 'bootstrap-vue';
import {
  capitalize,
  cloneDeep,
  each,
  has,
  isUndefined,
  pick,
} from 'lodash';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrListResource from '@forgerock/platform-shared/src/components/resource/ListResource';
import FrCreateResource from '@forgerock/platform-shared/src/components/resource/CreateResource';
import { getManagedResourceList, deleteManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getInternalResourceList, deleteInternalResource } from '@forgerock/platform-shared/src/api/InternalResourceApi';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';

/**
 * @description View for edit resource component
 *
 */
export default {
  name: 'ListResourceView',
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  components: {
    BCard,
    BContainer,
    FrCreateResource,
    FrHeader,
    FrListResource,
  },
  directives: {
    'b-modal': VBModal,
  },
  data() {
    return {
      displayName: capitalize(this.$route.params.resourceName),
      tableData: [],
      lastPage: true,
      currentTableParams: {},
      routerParameters: null,
      hasUpdateAccess: false,
      hasDeleteAccess: false,
      createProperties: null,
    };
  },
  mounted() {
    const idmInstance = this.getRequestService();

    axios.all([
      getSchema(`${this.$route.params.resourceType}/${this.$route.params.resourceName}`),
      idmInstance.get(`privilege/${this.$route.params.resourceType}/${this.$route.params.resourceName}`)]).then(axios.spread((schema, privilege) => {
      if (has(schema, 'data.title')) {
        this.displayName = schema.data.title;
      }
      const properties = {};
      if (privilege.data.VIEW.allowed) {
        // Generate columns for display and filtering for read/query
        each(privilege.data.VIEW.properties, (readProp) => {
          const property = schema.data.properties[readProp];
          if (property && isUndefined(property.encryption)) {
            properties[readProp] = property;
          }
        });
      }

      this.routerParameters = {
        resourceName: this.$route.params.resourceName,
        resourceType: this.$route.params.resourceType,
        managedProperties: properties,
        order: schema.data.order,
      };

      if (privilege.data.UPDATE.allowed) {
        this.hasUpdateAccess = true;
      }

      if (privilege.data.DELETE.allowed) {
        this.hasDeleteAccess = true;
      }

      if (privilege.data.CREATE.allowed) {
        const propList = pick(schema.data.properties, privilege.data.CREATE.properties);
        const requiredProps = [];

        schema.data.required.forEach((prop) => {
          const tempProp = cloneDeep(propList[prop]);
          tempProp.key = prop;
          tempProp.required = true;
          requiredProps.push(tempProp);
        });

        // Special case for Assignments, add 'attributes' property so it is included in createProperties for the CreateResource modal.
        if (this.routerParameters.resourceName === 'assignment') {
          propList.attributes.key = 'attributes';
          requiredProps.push(propList.attributes);
        }

        // Special case for Internal and Managed Roles, add 'condition' and 'temporalConstraints' properties so they are included in createProperties for the CreateResource modal.
        if (this.routerParameters.resourceName === 'role') {
          // Another special case for internal role add 'privileges'
          if (propList.privileges && this.routerParameters.resourceType === 'internal') {
            propList.privileges.key = 'privileges';
            requiredProps.push(propList.privileges);
          }

          if (propList.condition) {
            propList.condition.key = 'condition';
            requiredProps.push(propList.condition);
          }
          if (propList.temporalConstraints) {
            propList.temporalConstraints.key = 'temporalConstraints';
            requiredProps.push(propList.temporalConstraints);
          }
          if (propList.description) {
            const description = cloneDeep(propList.description);
            description.key = 'description';
            description.title = `${this.$t('common.optionalFieldTitle', { fieldTitle: this.$t('common.description') })}`;
            description.isOptional = true;
            requiredProps.push(description);
          }
        }

        this.createProperties = requiredProps;
      }
    }), (error) => {
      this.displayNotification('IDMMessages', 'error', error.response.data.message);
    });
  },
  methods: {
    deleteManagedResource,
    deleteInternalResource,
    /**
     * Builds url to call for API to pull table data of current managed resource
     *
     * @param {string} filter - Required resource name (e.g., user or role)
     * @param {array} fields - Required array of fields to query and display
     * @param {string} sortField - Required field name that is sorted initially
     * @param {number} page - Required number of page of table where we are viewing
     */
    buildUrlParams(filter, fields, sortField, page) {
      const managedResourceParams = {
        queryFilter: filter,
        pageSize: 10,
        totalPagedResultsPolicy: 'EXACT',
      };
      let sortKeys = sortField;

      if (!sortKeys) {
        // Default to sorting on first column
        [sortKeys] = fields;
      }

      if (sortKeys) {
        managedResourceParams.sortKeys = sortKeys;
      }

      if (fields.length) {
        managedResourceParams.fields = fields.join(',');
      }

      if (page > 0) {
        const offsetCalc = page * 10;
        managedResourceParams.pagedResultsOffset = offsetCalc;
      }

      return managedResourceParams;
    },
    /**
     * Pulls table data of current managed resource using API and sets whether we
     * are on the last page of table
     *
     * @param {Object} tableParams - list table properties
     * @param {string} tableParams.filter - Required resource name (e.g., user or role)
     * @param {array} tableParams.fields - Required array of fields to query and display
     * @param {string} tableParams.sortField - Required field name that is sorted initially
     * @param {number} tableParams.page - Required number of page of table where we are viewing
     */
    getTableData(tableParams) {
      const {
        filter,
        fields,
        sortField,
        page,
      } = tableParams;
      let resourceFunction;
      this.currentTableParams = tableParams;
      if (this.routerParameters.resourceType === 'managed') {
        resourceFunction = getManagedResourceList(this.routerParameters.resourceName, this.buildUrlParams(filter, fields, sortField, page));
      } else {
        resourceFunction = getInternalResourceList(this.routerParameters.resourceName, this.buildUrlParams(filter, fields, sortField, page));
      }
      resourceFunction.then((resourceData) => {
        if (resourceData.data.pagedResultsCookie) {
          this.lastPage = false;
        } else {
          this.lastPage = true;
        }
        this.tableData = resourceData.data.result;
      }, (error) => {
        this.showErrorMessage(error, this.$t('authentication.errorRetrievingTableData'));
      });
    },
    resourceClicked(item) {
      this.$router.push({
        name: 'EditResource',
        params: {
          resourceType: this.$route.params.resourceType,
          resourceName: this.$route.params.resourceName,
          // eslint-disable-next-line no-underscore-dangle
          resourceId: item._id,
        },
      });
    },
  },
};
</script>
