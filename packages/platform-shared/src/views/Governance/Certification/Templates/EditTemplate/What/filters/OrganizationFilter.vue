<!-- Copyright 2024-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <h2 class="h5 mb-3">
      {{ $t('common.organizations') }}
    </h2>
    <FrField
      v-model="filterFields.orgFilter"
      class="mb-4"
      name="orgFilter"
      testid="org-selection"
      type="select"
      :options="orgFilterOptions" />
    <BCollapse :visible="filterFields.orgFilter === 'specificOrgs'">
      <FrGovResourceMultiselect
        v-model="filterFields.organizationSelection"
        class="mb-4"
        name="organizationSelection"
        :label="$t('common.organizations')"
        resource="organization" />
      <FrField
        v-model="filterFields.includeChildOrganizations"
        class="mb-2"
        name="includeChildOrganizations"
        type="checkbox"
        :label="$t('governance.certification.includeChildOrganizations')" />
    </BCollapse>
  </div>
</template>

<script setup>
/**
 * A filter used to match on organization
 */
import { BCollapse } from 'bootstrap-vue';
import { ref, watch } from 'vue';
import { cloneDeep } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceMultiselect from '@forgerock/platform-shared/src/components/governance/GovResourceMultiselect';
import i18n from '@/i18n';

const emit = defineEmits(['update-filter']);

const props = defineProps({
  filterData: {
    type: Object,
    default: () => ({}),
  },
});

const filterDataClone = cloneDeep(props.filterData);
const filterFields = ref({
  orgFilter: filterDataClone?.orgFilter || 'allOrgs',
  organizationSelection: filterDataClone?.organizationSelection || [],
  includeChildOrganizations: filterDataClone?.includeChildOrganizations,
});
const orgFilterOptions = [
  {
    text: i18n.global.t('governance.certification.allOrganizations'),
    value: 'allOrgs',
  },
  {
    text: i18n.global.t('governance.editTemplate.specificOrganizations'),
    value: 'specificOrgs',
  },
];

watch(filterFields, (newValue) => {
  // Handling the filterFields change
  emit('update-filter', {
    type: 'organization',
    filterFields: newValue,
  });
}, { deep: true, immediate: true });
</script>
