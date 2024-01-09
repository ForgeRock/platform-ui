<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    class="fr-report-view w-100 min-vh-100 bg-white p-0"
    fluid
  >
    <BRow class="w-100 shadow px-2 py-3 m-0 bg-white align-items-stretch">
      <BCol class="col-2 col-md-3 col-lg-4 d-flex align-items-center">
        <BLink
          v-if="!runDataLoading"
          class="text-decoration-none text-dark"
          variant="dark"
          @click="returnToTemplate()"
        >
          <FrIcon
            class="mr-3 md-24"
            name="arrow_back"
          />
          <span class="d-none d-lg-inline-block">
            {{ reportName }}
          </span>
        </BLink>
      </BCol>
      <BCol class="col-7 col-md-6 col-lg-4 d-flex justify-content-center align-items-center">
        <h3
          v-if="!runDataLoading"
          class="h4 my-3 text-nowrap text-truncate"
        >
          <span class="mr-2 text-nowrap d-flex">
            {{ reportDate }}
            <br class="d-md-none">
            {{ reportTime }}
          </span>
        </h3>
      </BCol>
      <BCol class="col-3 col-md-3 col-lg-4 d-flex justify-content-end align-items-center">
        <BDropdown
          right
          toggle-class="text-nowrap d-flex align-items-center"
          variant="primary"
          :disabled="loadingExport || (runDataLoading || tableLoading || isExpired || isTableEmpty)"
        >
          <template #button-content>
            <FrSpinner
              v-if="loadingExport"
              class="justify-content-center mr-2"
              :button-spinner="true"
              size="sm" />
            <FrIcon
              v-else
              class="mr-md-2"
              name="file_download" />
            <span class="d-none d-md-block">
              {{ $t('reports.export') }}
            </span>
          </template>
          <BDropdownItemButton
            button-class="d-flex align-items-center"
            @click.stop="generateReport('JSON', $bvModal)"
          >
            <template v-if="loadingJson">
              <FrSpinner
                class="justify-content-center mr-2"
                :button-spinner="true"
                size="sm" />
              {{ $t('reports.exportingFile', { fileType: 'JSON' }) }}
            </template>
            <template v-else-if="jsonStatus">
              <FrIcon
                class="mr-2"
                name="file_download"
              />
              {{ $t('reports.downloadFile', { fileType: 'JSON' }) }}
            </template>
            <template v-else>
              <FrIcon
                class="mr-2"
                name="sync"
              />
              {{ $t('reports.exportFile', { fileType: 'JSON' }) }}
            </template>
          </BDropdownItemButton>
          <BDropdownItemButton
            button-class="d-flex align-items-center"
            @click.stop="generateReport('CSV', $bvModal)"
          >
            <template v-if="loadingCsv">
              <FrSpinner
                class="justify-content-center mr-2"
                :button-spinner="true"
                size="sm" />
              {{ $t('reports.exportingFile', { fileType: 'CSV' }) }}
            </template>
            <template v-else-if="csvStatus">
              <FrIcon
                class="mr-2"
                name="file_download"
              />
              {{ $t('reports.downloadFile', { fileType: 'CSV' }) }}
            </template>
            <template v-else>
              <FrIcon
                class="mr-2"
                name="sync"
              />
              {{ $t('reports.exportFile', { fileType: 'CSV' }) }}
            </template>
          </BDropdownItemButton>
        </BDropdown>
      </BCol>
    </BRow>
    <BRow class="p-4 m-0 border-bottom">
      <BCol class="rounded bg-light text-dark p-4">
        <BRow v-if="runDataLoading">
          <BCol
            v-for="index in 3"
            :key="index"
            class="col-sm-12 col-md-6 col-lg-4 mb-3"
          >
            <BSkeleton width="50px" />
            <BSkeleton width="100px" />
          </BCol>
        </BRow>
        <FrReportDetails
          v-else
          :parameters="params"
        />
      </BCol>
    </BRow>
    <BRow class="w-100 m-0">
      <BCol v-if="isExpired">
        <FrNoData
          icon-classes="d-none"
          testid="no-data"
          :card="false"
          :subtitle="expiredMessage"
        />
      </BCol>
      <template>
        <BCol class="p-0">
          <FrReportViewTable
            id="viewTable"
            testid="report-table"
            :current-page="!runDataLoadingComplete ? 0 : currentPage"
            :fields="tableFields"
            :is-empty="isTableEmpty"
            :items="tableProvider"
            :loading="tableLoading || !runDataLoadingComplete"
            :per-page="perPage"
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
            @on-page-size-change="pageSizeChange"
          />
        </BCol>
      </template>
    </BRow>
    <FrReportExportModal
      :data="modalData.value"
      :file-type="type"
      :status="status"
      @download-report="generateReport($event.fileType, $bvModal)" />
  </BContainer>
</template>

<script setup>
import { ref } from 'vue'; import {
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
import i18n from '@/i18n';
import store from '@/store';

// Composables
const router = useRouter();
const route = useRoute();

const { id, template } = route.params;
const {
  fetchViewReport,
  expiredMessage,
  isExpired,
  isTableEmpty,
  pageToken,
  tableFields,
  tableItems,
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
const runData = ref({});
const modalData = ref({});

/**
 * Gets all the data to display at the top of the report from the Report Run object
 * and then calls the endpoint to get the View Report data.
 */
async function getConfigInfo() {
  reportDate.value = dayjs(runData.value.createDate).format('MM/D/YYYY');
  reportTime.value = dayjs(runData.value.createDate).format('h:mm A');
  reportName.value = startCase(runData.value.name.toLowerCase());
  csvStatus.value = runData.value.exportCsvStatus === 'EXPORT_SUCCESS';
  jsonStatus.value = runData.value.exportJsonStatus === 'EXPORT_SUCCESS';
  const [paramsWithoutRealm] = [JSON.parse(runData.value.parameters)].map(({ ...report }) => report);
  delete paramsWithoutRealm.realm;
  params.value = paramsWithoutRealm;
  const data = reportHistoryTableDataGenerator([runData.value]);
  modalData.value = data.flat();
}

/**
 * Calls the endpoint to get the data of the Report Run.
 */
async function getRunInfo() {
  try {
    runDataLoading.value = true;
    const result = await getReportRuns({ name: template, realm: store.state.realm });
    runData.value = result.result.find((run) => run.runId === id);
    getConfigInfo();
  } catch (err) {
    showErrorMessage(err, i18n.t('reports.error'));
  } finally {
    runDataLoading.value = false;
    runDataLoadingComplete.value = true;
  }
}

/**
 * Exports or downloads the report in CSV or JSON format.
 * @param {String} fileType Format to be exported or downloaded.
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
  currentPage.value = 1;
}

/**
 * Routes to the Report History page.
 */
function returnToTemplate() {
  router.push({ name: 'ReportTemplateHistory', params: { template } });
}

async function tableProvider(ctx) {
  try {
    const pagedResultOffset = (ctx.currentPage - 1) * ctx.perPage;
    await fetchViewReport(template, id, JSON.parse(runData.value.reportConfig), ctx.perPage, pagedResultOffset, pageToken.value);
    return tableItems.value;
  } catch (error) {
    return [];
  }
}

getRunInfo();

</script>
