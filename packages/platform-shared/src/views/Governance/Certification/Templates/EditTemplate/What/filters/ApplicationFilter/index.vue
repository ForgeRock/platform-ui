<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <h2 class="h5 mb-3">
      {{ $t('common.applications') }}
    </h2>
    <FrField
      v-model="filterFields.appSelection"
      class="mb-4"
      name="appSelection"
      testid="app-selection"
      type="select"
      :options="applicationSelectionOptions" />
    <BCollapse :visible="filterFields.appSelection === $t('governance.editTemplate.specificApplications')">
      <FrGovResourceMultiselect
        v-model="filterFields.singleApp"
        class="mb-4"
        name="singleApp"
        :resource-function="resourceFunction"
        :query-param-function="queryParamFunction"
        :option-function="optionFunction"
        :label="$t('governance.editTemplate.applicationsToCertify')" />
    </BCollapse>
    <BCollapse :visible="filterFields.appSelection === $t('governance.editTemplate.filterApplications')">
      <FrCertificationFilter
        @filter-update="filterFields.appFilter = $event"
        class="mb-4"
        :resource-name="$t('governance.editTemplate.applications')"
        :properties="applicationProperties"
        :filter="filterFields.appFilter">
        <template #prefix>
          {{ $t('governance.editTemplate.certifyApplicationsPrefix') }}
        </template>
        <template #suffix>
          {{ $t('governance.editTemplate.certifyApplicationsSuffix') }}
        </template>
      </FrCertificationFilter>
    </BCollapse>
  </div>
</template>
<script>

import {
  BCollapse,
} from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCertificationFilter from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter';
import FrGovResourceMultiselect from '@forgerock/platform-shared/src/components/governance/GovResourceMultiselect';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getApplications } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { getAllNonAuthoritativeApplications, getEqualityFilter } from '@forgerock/platform-shared/src/views/Governance/utils/certification';

/**
 * A filter used to match on application properties
 */
export default {
  name: 'ApplicationFilter',
  components: {
    BCollapse,
    FrGovResourceMultiselect,
    FrCertificationFilter,
    FrField,
  },
  props: {
    filterData: {
      type: Object,
      default: () => ({}),
    },
    filterNonNhiApplications: {
      type: Boolean,
      default: false,
    },
    properties: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const filterDataClone = cloneDeep(this.filterData);
    return {
      filterFields: {
        appSelection: filterDataClone?.appSelection || '',
        singleApp: filterDataClone?.singleApp || [],
        appFilter: filterDataClone?.appFilter || {},
      },
    };
  },
  computed: {
    applicationProperties() {
      return this.properties.application?.map((application) => ({
        value: application.key,
        label: application.displayName,
        type: application.type,
        path: application.managedObjectType,
      }));
    },
    applicationSelectionOptions() {
      const options = [
        this.$t('governance.editTemplate.allApplications'),
        this.$t('governance.editTemplate.specificApplications'),
        this.$t('governance.editTemplate.filterApplications'),
      ];
      if (!this.applicationProperties?.length) options.pop();
      return options;
    },
    resourceFunction() {
      return this.filterNonNhiApplications ? getApplications : undefined;
    },
  },
  methods: {
    /**
     * Queries only applications that have at least one non-NHI object type.
     * Uses the disconnected application path, where the document is the
     * application itself (fields are unprefixed, unlike the catalog search).
     *
     * @param {String} queryString search term
     * @param {String} resource resource type
     * @param {Boolean} singleResource whether to look up one application by id
     * @returns {Object} query params for governance/application
     */
    queryParamFunction(queryString, resource, singleResource) {
      if (!this.filterNonNhiApplications) return undefined;
      const filters = ['objectTypes.isNHI eq "false"'];
      if (singleResource) {
        return { disconnected: true, queryFilter: `id eq "${queryString}" and ${filters[0]}` };
      }
      if (queryString) filters.unshift(`name co "${queryString}"`);
      return {
        disconnected: true,
        pageSize: 10,
        queryFilter: filters.join(' and '),
      };
    },
    /**
     * Maps governance/application results to multiselect options.
     *
     * @param {Object} application application record from the governance API
     * @returns {Object} option with text and value
     */
    optionFunction(application) {
      return {
        text: application.application?.name || application.name,
        value: application.id || application.application?.id,
      };
    },
    getApplicationFilters() {
      let appFilter = null;
      switch (this.filterFields.appSelection) {
        case this.$t('governance.editTemplate.allApplications'):
          appFilter = getAllNonAuthoritativeApplications();
          break;
        case this.$t('governance.editTemplate.specificApplications'):
          appFilter = this.filterFields.singleApp?.length
            ? getEqualityFilter('id', this.filterFields.singleApp)
            : getEqualityFilter('id', ['']);
          break;
        case this.$t('governance.editTemplate.filterApplications'):
          appFilter = getGovernanceFilter(this.filterFields.appFilter);
          break;
        default:
          break;
      }
      return appFilter;
    },
  },
  watch: {
    filterFields: {
      deep: true,
      handler(filterFields) {
        this.$emit('update-filter', {
          type: 'application',
          filter: this.getApplicationFilters(),
          filterFields,
        });
      },
    },
  },
};
</script>
