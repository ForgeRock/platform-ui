<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <h2 class="h5 mb-3">
      {{ $t('common.resources') }}
    </h2>
    <FrField
      v-model="filterFields.resourceSelection"
      class="mb-4"
      name="resourceSelection"
      testid="resource-selection"
      type="select"
      :options="resourceSelectionOptions" />
    <BCollapse :visible="filterFields.resourceSelection === $t('governance.editTemplate.filterResources')">
      <FrCertificationFilter
        @filter-update="filterFields.resourceFilter = $event"
        class="mb-4"
        :resource-name="$t('common.resources')"
        :properties="resourceProperties"
        :filter="filterFields.resourceFilter">
        <template #prefix>
          {{ $t('governance.editTemplate.certifyResourcesPrefix') }}
        </template>
        <template #suffix>
          {{ $t('governance.editTemplate.certifyResourcesSuffix') }}
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
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getAllFilter } from '@forgerock/platform-shared/src/views/Governance/utils/certification';

/**
 * A filter used to match on Resource properties
 */
export default {
  name: 'ResourceFilter',
  components: {
    BCollapse,
    FrCertificationFilter,
    FrField,
  },
  data() {
    const filterDataClone = cloneDeep(this.filterData);
    return {
      filterFields: {
        resourceSelection: filterDataClone?.resourceSelection || '',
        resourceFilter: filterDataClone?.resourceFilter || {},
      },
    };
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
  computed: {
    resourceProperties() {
      return this.properties.resource?.map((resource) => ({
        value: resource.key || resource.name,
        label: resource.displayName,
        type: resource.type,
        path: resource.managedObjectType || resource.objectType,
      }));
    },
    resourceSelectionOptions() {
      const options = [
        this.$t('governance.editTemplate.allResources'),
        this.$t('governance.editTemplate.filterResources'),
      ];
      if (!this.resourceProperties?.length) options.pop();
      return options;
    },
  },
  methods: {
    getResourcesFilter() {
      let resourceFilter = null;
      switch (this.filterFields.resourceSelection) {
        case this.$t('governance.editTemplate.allResources'):
          resourceFilter = getAllFilter();
          break;
        case this.$t('governance.editTemplate.filterResources'):
          resourceFilter = getGovernanceFilter(this.filterFields.resourceFilter);
          break;
        default:
          break;
      }
      return resourceFilter;
    },
  },
  watch: {
    filterFields: {
      deep: true,
      handler(filterFields) {
        this.$emit('update-filter', {
          type: 'resource',
          filter: this.getResourcesFilter(),
          filterFields,
        });
      },
    },
  },
};
</script>
