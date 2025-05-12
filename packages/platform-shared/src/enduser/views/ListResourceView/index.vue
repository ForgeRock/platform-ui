<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <div class="mt-5">
      <FrHeader
        :title="getTranslation(displayName)"
        :subtitle="$t('pages.identities.subTitle')" />
      <BCard
        no-body
        class="card-tabs-vertical">
        <FrListResource
          v-if="routerParameters"
          :current-page="currentPage"
          :router-parameters="routerParameters"
          :resource-title="displayName"
          :table-data="tableData"
          :table-data-total-rows="tableDataTotalRows"
          :last-page="lastPage"
          :edit-access="hasUpdateAccess"
          :delete-access="hasDeleteAccess"
          :is-loading="showWheel"
          :no-data="noData"
          :query-threshold="queryThreshold"
          :show-divider="createProperties !== null"
          @clear-table="resetTableData"
          @get-table-data="getTableData"
          @row-clicked="resourceClicked"
          @delete-resource="deleteResource">
          <template #listToolbar>
            <BButton
              v-if="createProperties"
              v-b-modal.createResourceModal
              type="button"
              variant="primary">
              <FrIcon
                icon-class="mr-2"
                name="add">
                {{ $t("common.newObject", {object: getTranslation(displayName)}) }}
              </FrIcon>
            </BButton>
          </template>
        </FrListResource>
        <FrCreateResource
          v-if="routerParameters && createProperties"
          @show-details="resourceClicked"
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
  BButton,
  BCard,
  BContainer,
  VBModal,
} from 'bootstrap-vue';
import {
  capitalize,
  cloneDeep,
  each,
  findIndex,
  has,
  isUndefined,
  pick,
} from 'lodash';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import FrListResource from '@forgerock/platform-shared/src/components/resource/ListResource';
import FrCreateResource from '@forgerock/platform-shared/src/components/resource/CreateResource';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getManagedResourceList, deleteManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getInternalResourceList, deleteInternalResource } from '@forgerock/platform-shared/src/api/InternalResourceApi';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';

/**
 * @description View for edit resource component
 *
 */
export default {
  name: 'ListResourceView',
  mixins: [
    NotificationMixin,
    ResourceMixin,
    RestMixin,
    TranslationMixin,
  ],
  components: {
    BButton,
    BCard,
    BContainer,
    FrCreateResource,
    FrHeader,
    FrIcon,
    FrListResource,
  },
  directives: {
    'b-modal': VBModal,
  },
  data() {
    return {
      currentPage: 1,
      displayName: capitalize(this.$route.params.resourceName),
      tableData: [],
      tableDataTotalRows: 0,
      lastPage: true,
      currentTableParams: {},
      routerParameters: null,
      hasUpdateAccess: false,
      hasDeleteAccess: false,
      createProperties: null,
      queryThreshold: null,
      noData: false,
      showWheel: false,
    };
  },
  mounted() {
    const idmInstance = this.getRequestService();

    axios.all([
      getSchema(`${this.$route.params.resourceType}/${this.$route.params.resourceName}`),
      idmInstance.get(`privilege/${this.$route.params.resourceType}/${this.$route.params.resourceName}`),
    ]).then(axios.spread((schema, privilege) => {
      let { resourceName } = this.$route.params;

      if (resourceName === 'role' && this.$route.params.resourceType === 'internal') {
        resourceName = 'internalrole';
      }

      if (has(schema, 'data.title')) {
        this.displayName = schema.data.title;
      }

      this.getMinimumUIFilterLength(resourceName).then((minimumUIFilterLength) => {
        this.queryThreshold = minimumUIFilterLength;

        this.setPrivileges(privilege, schema);
      });
    }), (error) => {
      this.showErrorMessage(error, this.$t('errors.retrievingObject', { object: this.$route.params.resourceName }));
    });
  },
  methods: {
    /**
     * Builds url to call for API to pull table data of current managed resource
     *
     * @param {string} filter - Required resource name (e.g., user or role)
     * @param {array} fields - Required array of fields to query and display
     * @param {string} sortField - Required field name that is sorted initially
     * @param {number} page - Required number of page of table where we are viewing
     */
    buildUrlParams(filter, fields, sortField, page, pageSize) {
      const managedResourceParams = {
        queryFilter: filter,
        pageSize,
        totalPagedResultsPolicy: 'EXACT',
      };
      let sortKeys = sortField;

      if (!sortKeys && (!this.queryThreshold && filter === 'true')) {
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
        const offsetCalc = page * pageSize;
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
        pageSize,
      } = tableParams;
      let resourceFunction;

      this.showWheel = true;
      this.currentTableParams = tableParams;
      if (this.routerParameters.resourceType === 'managed') {
        resourceFunction = getManagedResourceList(this.routerParameters.resourceName, this.buildUrlParams(filter, fields, sortField, page - 1, pageSize));
      } else {
        resourceFunction = getInternalResourceList(this.routerParameters.resourceName, this.buildUrlParams(filter, fields, sortField, page - 1, pageSize));
      }
      resourceFunction.then((resourceData) => {
        // set noData prop for ListResource
        this.noData = resourceData.data.result.length === 0;

        if (resourceData.data.pagedResultsCookie) {
          this.lastPage = false;
        } else {
          this.lastPage = true;
        }

        this.currentPage = page;
        this.showWheel = false;
        this.tableData = resourceData.data.result;
        this.tableDataTotalRows = resourceData.data.totalPagedResults;
      }, (error) => {
        this.showWheel = false;
        this.showErrorMessage(error, this.$t('journey.errorRetrievingTableData'));
      });
    },
    resourceClicked(item) {
      this.$router.push({
        name: 'EditResource',
        params: {
          resourceType: this.$route.params.resourceType,
          resourceName: this.$route.params.resourceName,
          resourceId: item._id,
        },
      });
    },
    /**
     * Trigger deletion of a resource
     *
     * @param {String} id the id of the resource to delete
     */
    deleteResource(id) {
      const { resourceName, resourceType } = this.routerParameters;
      const resourceFunction = resourceType === 'managed' ? deleteManagedResource : deleteInternalResource;

      resourceFunction(resourceName, id)
        .catch((err) => {
          this.showErrorMessage(
            err,
            this.$t('application.errors.errorDeletingResource'),
          );
        })
        .finally(() => {
          if (this.tableData.length === 1 && this.lastPage) {
            this.currentTableParams.page -= 1;
          }
          this.getTableData(this.currentTableParams);
        });
    },
    resetTableData() {
      this.tableData = [];
      this.tableDataTotalRows = 0;
    },
    setPrivileges(privilege, schema) {
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
        if (this.routerParameters.resourceName.endsWith('assignment')) {
          propList.attributes.key = 'attributes';
          requiredProps.push(propList.attributes);
        }

        // Special case for Internal and Managed Roles, add 'condition' and 'temporalConstraints' properties so they are included in createProperties for the CreateResource modal.
        if (this.routerParameters.resourceName.endsWith('role')) {
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

        // Special case for Organization, add 'parent' property so it is included in createProperties for the CreateResource modal.
        if (this.routerParameters.resourceName.endsWith('organization') && propList.parent && findIndex(requiredProps, { key: 'parent' }) === -1) {
          // Note: only added if "parent" exists in CREATE privileges for current user (i.e. organization admin/owner)
          propList.parent.key = 'parent';
          requiredProps.push(propList.parent);
        }

        // Special case for User, add 'memberOfOrg' property so it is included in createProperties for the CreateResource modal.
        if (this.routerParameters.resourceName.endsWith('user') && propList.memberOfOrg && findIndex(requiredProps, { key: 'memberOfOrg' }) === -1) {
          // Note: only added if "memberOfOrg" exists in CREATE privileges for current user (i.e. organization admin/owner)
          propList.memberOfOrg.key = 'memberOfOrg';
          propList.memberOfOrg.validation = 'required';
          requiredProps.push(propList.memberOfOrg);
        }

        this.createProperties = requiredProps;
      }
    },
  },
};
</script>
