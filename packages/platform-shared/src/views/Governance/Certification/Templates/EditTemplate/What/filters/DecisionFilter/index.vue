<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrField
      v-model="filterFields.enableCertDecisionFilter"
      class="mb-4"
      name="enableCertDecisionFilter"
      testid="enable-cert-decision-filter"
      type="checkbox"
      :label="$t('governance.editTemplate.filterCertDecision')" />
    <BCollapse :visible="filterFields.enableCertDecisionFilter">
      <FrCertificationFilter
        @filter-update="filterFields.decisionFilter = $event"
        class="mb-4"
        :resource-name="$t('governance.editTemplate.decision')"
        :properties="decisionProperties"
        :filter="filterFields.decisionFilter">
        <template #prefix>
          {{ $t('governance.editTemplate.certifyAccountsPrefix') }}
        </template>
        <template #suffix>
          {{ $t('governance.editTemplate.certifyAccountsSuffix') }}
        </template>
      </FrCertificationFilter>
    </BCollapse>
  </div>
</template>
<script>
import {
  BCollapse,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCertificationFilter from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { cloneDeep } from 'lodash';
import { getAllFilter } from '@forgerock/platform-shared/src/views/Governance/utils/certification';

/**
 * A filter used to match based on previous certification decisions
 */
export default {
  name: 'DecisionFilter',
  components: {
    BCollapse,
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
        enableCertDecisionFilter: filterDataClone?.enableCertDecisionFilter || false,
        decisionFilter: filterDataClone?.decisionFilter || {},
      },
    };
  },
  computed: {
    decisionProperties() {
      return this.properties.decision?.map((decision) => ({
        value: decision.key,
        label: decision.displayName,
        type: decision.type,
        path: decision.managedObjectType,
      }));
    },
  },
  methods: {
    getDecisionFilter(filterFields) {
      const decisionFilter = filterFields.enableCertDecisionFilter
        ? getGovernanceFilter(filterFields.decisionFilter)
        : getAllFilter();
      return decisionFilter;
    },
  },
  watch: {
    filterFields: {
      deep: true,
      handler(filterFields) {
        this.$emit('update-filter', {
          type: 'decision',
          filter: this.getDecisionFilter(filterFields),
          filterFields,
        });
      },
    },
  },
};
</script>
