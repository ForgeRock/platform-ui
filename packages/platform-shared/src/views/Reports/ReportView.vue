<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    class="fr-report-view w-100 min-vh-100 bg-white p-0"
    fluid>
    <BRow class="w-100 shadow px-2 py-3 m-0 bg-white align-items-stretch">
      <BCol class="col-2 col-md-3 col-lg-4 d-flex align-items-center">
        <BLink
          v-if="!runDataLoading"
          class="text-decoration-none text-dark"
          variant="dark"
          @click="returnToTemplate()">
          <FrIcon
            icon-class="mr-3 md-24"
            name="arrow_back">
            <span class="d-none d-lg-inline-block">
              {{ reportName }}
            </span>
          </FrIcon>
        </BLink>
      </BCol>
      <BCol class="col-7 col-md-6 col-lg-4 d-flex flex-column justify-content-center align-items-center">
        <h3
          v-if="!runDataLoading"
          class="h4 my-0 text-center">
          {{ reportName }}
        </h3>
        <span class="text-center">
          {{ reportDate }} {{ reportTime }}
        </span>
      </BCol>
      <BCol
        v-if="state !== 'draft'"
        class="col-3 col-md-3 col-lg-4 d-flex justify-content-end align-items-center">
        <BDropdown
          right
          toggle-class="text-nowrap d-flex align-items-center"
          variant="primary"
          :disabled="loadingExport || (runDataLoading || tableLoading || isExpired || !tableItems.length)">
          <template #button-content>
            <FrSpinner
              v-if="loadingExport"
              class="justify-content-center mr-2"
              :button-spinner="true"
              size="sm" />
            <FrIcon
              v-else
              icon-class="mr-md-2"
              name="file_download" />
            <span class="d-none d-md-block">
              {{ $t('reports.export') }}
            </span>
          </template>
          <BDropdownItemButton
            button-class="d-flex align-items-center"
            @click.stop="generateReport('JSON', $bvModal)">
            <template v-if="loadingJson">
              <FrSpinner
                class="justify-content-center mr-2"
                :button-spinner="true"
                size="sm" />
              {{ $t('reports.exportingFile', { fileType: 'JSON' }) }}
            </template>
            <template v-else-if="jsonStatus">
              <FrIcon
                icon-class="mr-2"
                name="file_download">
                {{ $t('reports.downloadFile', { fileType: 'JSON' }) }}
              </FrIcon>
            </template>
            <template v-else>
              <FrIcon
                icon-class="mr-2"
                name="sync">
                {{ $t('reports.exportFile', { fileType: 'JSON' }) }}
              </FrIcon>
            </template>
          </BDropdownItemButton>
          <BDropdownItemButton
            button-class="d-flex align-items-center"
            @click.stop="generateReport('CSV', $bvModal)">
            <template v-if="loadingCsv">
              <FrSpinner
                class="justify-content-center mr-2"
                :button-spinner="true"
                size="sm" />
              {{ $t('reports.exportingFile', { fileType: 'CSV' }) }}
            </template>
            <template v-else-if="csvStatus">
              <FrIcon
                icon-class="mr-2"
                name="file_download">
                {{ $t('reports.downloadFile', { fileType: 'CSV' }) }}
              </FrIcon>
            </template>
            <template v-else>
              <FrIcon
                icon-class="mr-2"
                name="sync">
                {{ $t('reports.exportFile', { fileType: 'CSV' }) }}
              </FrIcon>
            </template>
          </BDropdownItemButton>
        </BDropdown>
      </BCol>
    </BRow>
    <BRow class="p-4 m-0 border-bottom">
      <BCol class="rounded bg-light text-dark p-4">
        <BRow
          v-if="runDataLoading"
          data-testid="skeleton-loader">
          <BCol
            v-for="index in 3"
            :key="index"
            class="col-sm-12 col-md-6 col-lg-4 mb-3">
            <BSkeleton width="50px" />
            <BSkeleton width="100px" />
          </BCol>
        </BRow>
        <FrReportDetails
          v-else
          :parameters="params" />
      </BCol>
    </BRow>
    <BRow class="w-100 m-0">
      <BCol v-if="isExpired">
        <FrNoData
          icon-classes="d-none"
          testid="no-data"
          :card="false"
          :subtitle="expiredMessage" />
      </BCol>
      <BCol
        v-else
        class="p-0">
        <FrReportViewTable
          id="viewTable"
          testid="report-table"
          :current-page="!runDataLoadingComplete ? 0 : currentPage"
          :fields="tableFields"
          :is-empty="!tableItems.length"
          :items="tableItems"
          :loading="tableLoading || !runDataLoadingComplete"
          :per-page="perPage"
          :sort-by="sortBy"
          :sort-desc="sortDirection === 'desc'"
          @sort-changed="onSortChanged"
        />
        <FrPagination
          :value="currentPage"
          @input="currentPage = $event;"
          aria-controls="viewTable"
          class="border-0"
          :current-page="1"
          :disabled="tableLoading"
          :per-page="perPage"
          :total-rows="totalRows"
          @on-page-size-change="pageSizeChange" />
      </BCol>
    </BRow>
    <FrReportExportModal
      :data="modalData.value"
      :file-type="type"
      :status="status"
      @download-report="generateReport($event.fileType, $bvModal)" />
  </BContainer>
</template>

<script setup>
import { ref, watch } from 'vue'; import {
  BCol,
  BContainer,
  BDropdown,
  BDropdownItemButton,
  BLink,
  BRow,
  BSkeleton,
} from 'bootstrap-vue';
import { getReportRuns } from '@forgerock/platform-shared/src/api/AutoApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { startCase } from 'lodash';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrReportDetails from './ReportDetails';
import FrReportExportModal from './modals/ReportExportModal';
import FrReportViewTable from './ReportViewTable';
import useExportReport from './composables/ExportReport';
import useViewReportTable from './composables/ViewReportTable';
import useRunHistoryTable from './composables/RunHistoryTable';
import ParametersSchema from './utils/ParametersSchema';
import i18n from '@/i18n';
import store from '@/store';

// Composables
const router = useRouter();
const route = useRoute();

const { id, state, template } = route.params;
const {
  fetchViewReport,
  expiredMessage,
  isExpired,
  nonSortableColumns,
  sortable,
  tableLoading,
  totalRows,
} = useViewReportTable();
const {
  fetchExport,
  loadingExport,
  loadingCsv,
  loadingJson,
  csvStatus,
  jsonStatus,
  type,
  status,
} = useExportReport(template, id);
const { getExportFormatType, reportHistoryTableDataGenerator } = useRunHistoryTable();
const currentPage = ref(1);
const runDataLoading = ref(false);
const runDataLoadingComplete = ref(false);
const params = ref({});
const perPage = ref(10);
const reportName = ref('');
const reportDate = ref('');
const reportTime = ref('');
const sortBy = ref(null);
const sortDirection = ref('desc');
const tableFields = ref([]);
const tableItems = ref([]);
const modalData = ref({});

/**
 * Gets all the data to display at the top of the report from the Report Run object
 * and then calls the endpoint to get the View Report data.
 * @param {Object} report current report object details
 */
async function setConfigInfo(report) {
  reportDate.value = dayjs(report.createDate).format('MM/D/YYYY');
  reportTime.value = dayjs(report.createDate).format('h:mm A');
  reportName.value = startCase(report.name?.toLowerCase());
  csvStatus.value = report.exportCsvStatus === 'EXPORT_SUCCESS';
  jsonStatus.value = report.exportJsonStatus === 'EXPORT_SUCCESS';

  const reportConfig = JSON.parse(report.reportConfig);
  const reportConfigParameters = reportConfig.parameters;
  const reportParameters = JSON.parse(report.parameters);
  const Parameters = ParametersSchema(reportConfig);
  const parametersWithLabels = Object.keys(reportParameters).map((paramKey) => {
    let reportConfigParamLabel = reportConfigParameters[paramKey]?.label;
    if (reportConfigParamLabel === 'Timeframe') {
      if (paramKey === 'startDate') {
        reportConfigParamLabel = i18n.global.t('reports.tabs.runReport.timeframe.startDate');
      } else if (paramKey === 'endDate') {
        reportConfigParamLabel = i18n.global.t('reports.tabs.runReport.timeframe.endDate');
      }
    }
    const reportControllerLabel = Parameters[paramKey]?.label;
    const label = reportConfigParamLabel || reportControllerLabel || paramKey;
    const paramValue = reportParameters[paramKey];
    const value = Array.isArray(paramValue) ? paramValue.join(', ') : paramValue;
    const parameterIsDate = !!Date.parse(value) && Parameters[paramKey].type !== 'number';
    return { label, value: parameterIsDate ? dayjs(value).format('MM/DD/YYYY') : value };
  });

  params.value = parametersWithLabels;
  const data = reportHistoryTableDataGenerator([report]);
  modalData.value = data.flat();
}

/**
 * Calls the endpoint to get the data of the Report Run.
 * @param {Object} sortData Contains field to sort by and sort direction (asc or desc)
 */
async function getRunInfo(sortData) {
  try {
    const pagedResultOffset = (currentPage.value - 1) * perPage.value;
    const reportResults = await fetchViewReport(id, template, state, perPage.value, pagedResultOffset, sortData);
    reportResults.forEach((item) => tableItems.value.push(item));

    // No results, so don't handle sorting
    if (reportResults.length) {
      tableFields.value = Object.keys(reportResults[0]).map((field) => {
        const isSortable = sortable.value && !nonSortableColumns.value.includes(field);
        return { key: field, sortable: isSortable };
      });

      // Default sorted column to the first item
      if (!sortData.sortBy) {
        sortBy.value = tableFields.value[0].key;
        sortDirection.value = sortData.sortDirection || 'desc';
      }
    }
  } catch (err) {
    showErrorMessage(err, i18n.global.t('common.error'));
  }
}

/**
 * Exports or downloads the report in CSV or JSON format.
 * @param {String} fileType Format to be exported or downloaded.
 * @param {Object} bvModal Modal
 */
async function generateReport(fileType, bvModal) {
  await fetchExport(template, id, getExportFormatType(fileType), bvModal);
}

/**
 * Changes the number of rows per page n the table.
 * @param {Number} pageSize The number of rows to show in the table.
 */
function pageSizeChange(pageSize) {
  perPage.value = pageSize;
  tableItems.value = [];
  if (currentPage.value === 1) {
    getRunInfo({ sortBy: sortBy.value, sortDirection: sortDirection.value });
  }
  currentPage.value = 1;
}

/**
 * Routes to the Report History page.
 */
function returnToTemplate() {
  router.push({ name: 'ReportHistory', params: { state, template } });
}

/**
 * Callback from clicking the sort icon in BTable
 * @param {Object} sortDetails Contains field to sort by and sort direction (asc or desc) from BTable
 */
function onSortChanged(sortDetails) {
  // This catches when a user clicks on a non-sortable column. Unfortunately bootstrap-vue allows this to happen.
  if (!sortDetails.sortBy.length) {
    return;
  }
  sortBy.value = sortDetails.sortBy;
  sortDirection.value = sortDetails.sortDesc ? 'desc' : 'asc';
  tableItems.value = [];
  currentPage.value = 1;
  getRunInfo({ sortBy: sortBy.value, sortDirection: sortDirection.value });
}

/**
 * Watchers
 */
watch(currentPage, (page) => {
  const expectedTotals = page * perPage.value;
  const remainder = expectedTotals - tableItems.value.length;
  if (expectedTotals > tableItems.value.length && remainder === perPage.value) {
    getRunInfo({ sortBy: sortBy.value, sortDirection: sortDirection.value });
  }
});

/**
 * Start
 */
(async () => {
  runDataLoading.value = true;
  const { result } = await getReportRuns({
    name: template,
    realm: store.state.realm,
    runId: id,
    templateType: state,
  });
  const [report] = result;
  setConfigInfo(report);
  getRunInfo({ sortBy: sortBy.value, sortDirection: sortDirection.value });
  runDataLoading.value = false;
  runDataLoadingComplete.value = true;
})();
</script>
