<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
  },
  methods: {
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
