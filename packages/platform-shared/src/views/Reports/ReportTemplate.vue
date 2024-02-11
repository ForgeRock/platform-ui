<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <div class="h-100 overflow-hidden">
    <FrReportTemplateHeader
      :disable-save="disableSave"
      :report-state="reportState"
      :saving="isSaving"
      :template-name="templateName"
      @delete="deleteTemplate"
      @duplicate="duplicateTemplate"
      @save="saveTemplate" />
    <main
      class="d-flex h-100 w-100"
      role="main">
      <template v-if="templateHasAtLeastOneDataSource">
        <FrReportDataSourceTable />
        <FrReportTemplateSettings />
      </template>
      <FrReportAddDataSourceCard
        v-else
        @open-data-source-modal="$bvModal.show('reports-data-source-modal')" />
    </main>
    <FrReportDataSourceModal @add-data-source="dataSourceHandler" />
  </div>
</template>

<script setup>
/**
 * @description
 * Main component that gives an admin the ability to create custom platform analytics reports.
 */
import { computed, ref } from 'vue';
import { displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import FrReportTemplateHeader from './ReportTemplate/ReportTemplateHeader';
import FrReportAddDataSourceCard from './ReportTemplate/ReportAddDataSourceCard';
import FrReportDataSourceTable from './ReportTemplate/ReportDataSourceTable';
import FrReportTemplateSettings from './ReportTemplate/ReportTemplateSettings';
import FrReportDataSourceModal from './modals/ReportDataSourceModal';
import i18n from '@/i18n';

// Globals
const disableSave = ref(true);
const isSaving = ref(false);
const reportState = ref('draft');
const templateName = ref(i18n.global.t('reports.template.newReportTemplate'));
const payload = ref({
  dataSource: '',
});
const templateHasAtLeastOneDataSource = computed(() => payload.value.dataSource);

function deleteTemplate() {
}

function dataSourceHandler(dataSource) {
  payload.value.dataSource = dataSource;
  if (dataSource) {
    displayNotification('success', i18n.global.t('reports.template.dataSetAdded'));
  }
}

function duplicateTemplate() {
}

function saveTemplate() {
}
</script>
