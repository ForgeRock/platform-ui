<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <h2 class="h5 mb-3">
      {{ $t('common.entitlements') }}
    </h2>
    <FrField
      v-model="filterFields.entitlementSelection"
      class="mb-4"
      name="entitlementSelection"
      testid="entitlement-selection"
      type="select"
      :options="entitlementSelectionOptions" />
    <BCollapse :visible="filterFields.entitlementSelection === $t('governance.editTemplate.filterEntitlements')">
      <FrCertificationFilter
        @filter-update="filterFields.entitlementFilter = $event"
        class="mb-4"
        :resource-name="$t('common.entitlements')"
        :properties="entitlementProperties"
        :filter="filterFields.entitlementFilter">
        <template #prefix>
          {{ $t('governance.editTemplate.certifyEntitlementsPrefix') }}
        </template>
        <template #suffix>
          {{ $t('governance.editTemplate.certifyEntitlementsSuffix') }}
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
 * A filter used to match on entitlement properties
 */
export default {
  name: 'EntitlementFilter',
  components: {
    BCollapse,
    FrCertificationFilter,
    FrField,
  },
  data() {
    const filterDataClone = cloneDeep(this.filterData);
    return {
      filterFields: {
        entitlementSelection: filterDataClone?.entitlementSelection || '',
        entitlementFilter: filterDataClone?.entitlementFilter || {},
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
    entitlementProperties() {
      return this.properties.entitlement?.map((entitlement) => ({
        value: entitlement.key,
        label: entitlement.displayName,
        type: entitlement.type,
        path: entitlement.managedObjectType,
      }));
    },
    entitlementSelectionOptions() {
      const options = [
        this.$t('governance.editTemplate.allEntitlements'),
        this.$t('governance.editTemplate.filterEntitlements'),
      ];
      if (!this.entitlementProperties?.length) options.pop();
      return options;
    },
  },
  methods: {
    getEntitlementsFilter() {
      let entitlementFilter = null;
      switch (this.filterFields.entitlementSelection) {
        case this.$t('governance.editTemplate.allEntitlements'):
          entitlementFilter = getAllFilter();
          break;
        case this.$t('governance.editTemplate.filterEntitlements'):
          entitlementFilter = getGovernanceFilter(this.filterFields.entitlementFilter);
          break;
        default:
          break;
      }
      return entitlementFilter;
    },
  },
  watch: {
    filterFields: {
      deep: true,
      handler(filterFields) {
        this.$emit('update-filter', {
          type: 'entitlement',
          filter: this.getEntitlementsFilter(),
          filterFields,
        });
      },
    },
  },
};
</script>
