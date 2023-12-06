<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      class="mb-3"
      name="applications"
      type="select"
      :options="applicationOptions"
      :placeholder="$t('reports.tabs.runReport.applications.allApplications')"
      @input="applicationsFieldValue = [$event]" />
    <BCollapse
      data-testid="all-applications-field"
      :visible="showSpecificApplications">
      <FrRelationshipEditField
        :query-filter-extension="appsQueryFilterExtension"
        :relationship-property="relationshipProperty"
        @relationship-property-update="applicationsRelationshipPropertyValue = $event.map(({ name }) => name)" />
    </BCollapse>
  </div>
</template>

<script setup>
/**
 * @description Displays the Applications field for running reports
 */
import { computed, ref, watch } from 'vue';
import { BCollapse } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrRelationshipEditField from './ReportsRelationshipEditField';
import i18n from '@/i18n';

defineProps({
  relationshipProperty: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['applications-update', 'relationship-property-update']);

const AM_TEMPLATE_IDS = ['web', 'native', 'service', 'saml', 'bookmark'];

const applicationOptions = [
  i18n.t('reports.tabs.runReport.applications.allApplications'),
  i18n.t('reports.tabs.runReport.applications.allOIDCApplications'),
  i18n.t('reports.tabs.runReport.applications.allSAMLApplications'),
  i18n.t('reports.tabs.runReport.applications.specificApplications'),
];
const applicationsFieldValue = ref([i18n.t('reports.tabs.runReport.applications.allApplications')]);
const applicationsRelationshipPropertyValue = ref([]);

const customClause = AM_TEMPLATE_IDS.map((a) => `templateName eq '${a}'`).join(' or ');
const appsQueryFilterExtension = `((${customClause}) or (!(authoritative eq true) and (mappingNames sw '')))`;
const showSpecificApplications = computed(() => {
  const [applicationsFieldSelection] = applicationsFieldValue.value;
  return applicationsFieldSelection === i18n.t('reports.tabs.runReport.applications.specificApplications');
});
const applicationsModel = computed(() => {
  const relationshipProperty = applicationsRelationshipPropertyValue.value;
  if (showSpecificApplications.value) {
    return relationshipProperty.length ? relationshipProperty : false;
  }
  return applicationsFieldValue.value;
});

/**
 * Watchers
 */
watch(() => applicationsModel.value, (value) => emit('applications-update', value), { immediate: true });
</script>
